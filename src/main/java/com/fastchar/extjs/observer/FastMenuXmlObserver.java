package com.fastchar.extjs.observer;

import com.fastchar.core.FastChar;
import com.fastchar.core.FastInterceptors;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.core.menus.FastMenuInfo;
import com.fastchar.extjs.interfaces.IFastMenuListener;
import com.fastchar.utils.FastMD5Utils;
import com.fastchar.utils.FastStringUtils;
import org.xml.sax.Attributes;
import org.xml.sax.Locator;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import java.io.File;
import java.io.FilenameFilter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class FastMenuXmlObserver {
    private static int FILE_COUNT = 0;
    private static final Map<String, Long> FILE_MODIFY_TICK = new HashMap<>();

    public static boolean isModified() {
        for (String s : FILE_MODIFY_TICK.keySet()) {
            File file = new File(s);
            if (file.lastModified() > FILE_MODIFY_TICK.get(s)) {
                return true;
            }
        }
        return getMenuXmlFiles().length > FILE_COUNT;
    }

    private static File[] getMenuXmlFiles() {
        final FastExtConfig config = FastChar.getConfig(FastExtConfig.class);

        File src = new File(FastChar.getPath().getClassRootPath());
        File[] files = src.listFiles(new FilenameFilter() {
            @Override
            public boolean accept(File dir, String name) {
                return name.toLowerCase().startsWith(config.getMenuPrefix()) && name.toLowerCase().endsWith(".xml");
            }
        });
        if (files == null) {
            files = new File[0];
        }
        return files;
    }

    private FastMenuInfo menus = new FastMenuInfo();

    public void onScannerFinish() throws Exception {
        FastChar.getValues().put("menus", menus);
        initMenuXml();
    }

    public void refreshMenus() throws Exception {
        initMenuXml();
    }

    private void initMenuXml() throws Exception {
        File[] files = getMenuXmlFiles();
        if (files.length == 0) {
            return;
        }
        FILE_COUNT = files.length;
        menus.clear();
        Arrays.sort(files, new Comparator<File>() {
            @Override
            public int compare(File o1, File o2) {
                return o1.compareTo(o2);
            }
        });
        SAXParserFactory factory = SAXParserFactory.newInstance();
        SAXParser parser = factory.newSAXParser();
        for (File file : files) {
            if (FastChar.getConfig(FastExtConfig.class).isExcludeMenuFile(file.getName())) {
                continue;
            }
            FILE_MODIFY_TICK.put(file.getAbsolutePath(), file.lastModified());
            MenuInfoHandler databaseInfoHandler = new MenuInfoHandler(file);
            parser.parse(file, databaseInfoHandler);
        }

        pullDefault(menus);
        sortMenus(menus);
        notifyListener(menus);
    }


    private void pullDefault(FastMenuInfo parent) {
        if (parent == null || parent.getChildren() == null) {
            return;
        }
        for (FastMenuInfo child : parent.getChildren()) {
            if (FastStringUtils.isEmpty(child.getColor())) {
                child.setColor(parent.getColor());
            }
            if (FastStringUtils.isEmpty(child.getIconValue())) {
                child.setIconValue(parent.getIconValue());
            }
            child.resetIcon();
            child.fromProperty();
            pullDefault(child);
        }
    }


    private void sortMenus(FastMenuInfo menuInfo) {
        for (FastMenuInfo child : menuInfo.getChildren()) {
            Comparator<FastMenuInfo> comparator = new Comparator<FastMenuInfo>() {
                @Override
                public int compare(FastMenuInfo o1, FastMenuInfo o2) {
                    return o1.getIndex().compareTo(o2.getIndex());
                }
            };
            sortMenus(child);
            Collections.sort(child.getChildren(), comparator);
        }
    }

    private void notifyListener(FastMenuInfo menuInfo) {
        List<IFastMenuListener> iFastMenuListeners = FastChar.getOverrides().singleInstances(false, IFastMenuListener.class);
        List<FastMenuInfo> waitRemoveMenu = new ArrayList<>();
        for (FastMenuInfo child : menuInfo.getChildren()) {
            for (IFastMenuListener iFastMenuListener : iFastMenuListeners) {
                if (iFastMenuListener == null) {
                    continue;
                }
                if (!iFastMenuListener.onAddMenu(child)) {
                    waitRemoveMenu.add(child);
                }
            }
            notifyListener(child);
        }
        menuInfo.getChildren().removeAll(waitRemoveMenu);

    }



    public class MenuInfoHandler extends DefaultHandler {
        private File xmlFile;
        private Locator locator;
        private LinkedList<FastMenuInfo> linked = new LinkedList<>();

        MenuInfoHandler(File xmlFile) {
            this.xmlFile = xmlFile;
        }

        @Override
        public void setDocumentLocator(Locator locator) {
            super.setDocumentLocator(locator);
            this.locator = locator;
        }

        @Override
        public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException {
            super.startElement(uri, localName, qName, attributes);
            if (qName.equalsIgnoreCase("menus")) {
                linked.add(menus);
            } else if (qName.equalsIgnoreCase("menu")) {
                FastMenuInfo menu = new FastMenuInfo();
                menu.setTagName(qName);
                menu.setLineNumber(locator.getLineNumber());
                menu.setFileName(xmlFile.getName());
                for (int i = 0; i < attributes.getLength(); i++) {
                    String attr = attributes.getQName(i);
                    String attrValue = getAttrValue(attributes, attr);
                    menu.set(attr.toLowerCase(), attrValue);
                }
                menu.setId(FastMD5Utils.MD5(linked.getLast().getId() + menu.getText()));
                menu.setParentId(linked.getLast().getId());
                menu.setIconValue(menu.getIcon());
                menu.setMethod(insertToFirstParam(menu.getMethod(), menu.getId()));
                menu.resetIcon();
                menu.fromProperty();
                linked.add(menu);
            }
        }

        private String insertToFirstParam(String method, String insertParam) {
            if (FastStringUtils.isNotEmpty(method)) {
                String regStr = ".*\\((.*)\\)";
                Matcher m = Pattern.compile(regStr).matcher(method);
                if (m.find()) {
                    insertParam = "'" + insertParam + "'";
                    String newParam = insertParam;
                    String oldParam = m.group(1);
                    if (FastStringUtils.isNotEmpty(oldParam)) {
                        newParam = insertParam + "," + oldParam;
                    }
                    return method.replace("(" + oldParam + ")", "(" + newParam + ")");
                }
            }
            return method;
        }


        @Override
        public void endElement(String uri, String localName, String qName) throws SAXException {
            super.endElement(uri, localName, qName);
            if (qName.equalsIgnoreCase("menus")) {
                menus.fromProperty();
            } else if (qName.equalsIgnoreCase("menu")) {
                FastMenuInfo menuInfo = linked.removeLast();
                menuInfo.setDepth(linked.size());
                menuInfo.put("webMenu", true);
                if (linked.size() > 0) {
                    FastMenuInfo last = linked.getLast();
                    if (last.getChildren() == null) {
                        last.setChildren(new ArrayList<FastMenuInfo>());
                    }
                    FastMenuInfo existMenu = last.getMenuInfo(menuInfo.getText());
                    if (existMenu != null) {
                        menuInfo.fromProperty();
                        existMenu.merge(menuInfo);
                        existMenu.fromProperty();
                        return;
                    } else {
                        last.getChildren().add(menuInfo);
                    }
                }
                menuInfo.setLeaf(menuInfo.getChildren() == null || menuInfo.getChildren().size() == 0);
                menuInfo.fromProperty();
                menuInfo.validate();

            }
        }


        String getAttrValue(Attributes attributes, String attr) {
            String value = attributes.getValue(attr);
            if (FastChar.getSecurity() == null) {
                return value;
            }
            //尝试解密
            String decrypt = FastChar.getSecurity().AES_Decrypt(FastChar.getConstant().getEncryptPassword(),value);
            if (FastStringUtils.isNotEmpty(decrypt)) {
                value = decrypt;
            }
            return value;
        }
    }

}
