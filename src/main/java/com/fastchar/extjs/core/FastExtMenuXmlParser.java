package com.fastchar.extjs.core;

import com.fastchar.core.FastChar;
import com.fastchar.extjs.FastExtConfig;
import com.fastchar.extjs.accepter.FastExtMenuXmlAccepter;
import com.fastchar.extjs.core.menus.FastMenuInfo;
import com.fastchar.extjs.interfaces.IFastMenuXmlListener;
import com.fastchar.utils.FastMD5Utils;
import com.fastchar.utils.FastNumberUtils;
import com.fastchar.utils.FastStringUtils;
import org.xml.sax.Attributes;
import org.xml.sax.Locator;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import java.io.File;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class FastExtMenuXmlParser {
    public static FastExtMenuXmlParser newInstance() {
        return FastChar.getOverrides().newInstance(FastExtMenuXmlParser.class);
    }

    private final FastMenuInfo menus = new FastMenuInfo();
    private boolean parsedMenuXml = false;


    private List<File> getMenuXmlFiles() {
        List<File> menuXmlList = new ArrayList<>();
        for (String path : FastExtMenuXmlAccepter.MENU_XML_PATH_LIST) {
            File menuFile = new File(path);
            List<IFastMenuXmlListener> iFastMenuListeners = FastChar.getOverrides().singleInstances(false, IFastMenuXmlListener.class);
            boolean isJump = false;
            for (IFastMenuXmlListener iFastMenuListener : iFastMenuListeners) {
                Boolean onParseMenuXml = iFastMenuListener.onParseMenuXml(menuFile);
                if (onParseMenuXml == null) {
                    continue;
                }
                if (!onParseMenuXml) {
                    isJump = true;
                    break;
                }
            }
            if (isJump) {
                continue;
            }
            menuXmlList.add(menuFile);
        }
        return menuXmlList;
    }

    private void initMenuXml() {
        try {
            List<File> files = getMenuXmlFiles();
            if (files.size() == 0) {
                return;
            }
            menus.clear();
            menus.setRoot(true);
            Collections.sort(files, new Comparator<File>() {
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
                MenuInfoHandler databaseInfoHandler = new MenuInfoHandler(file);
                parser.parse(file, databaseInfoHandler);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            pullDefault(menus);
            sortMenus(menus);
            parsedMenuXml = true;
        }

    }

    private void pullDefault(FastMenuInfo parent) {
        if (parent == null || parent.getChildren() == null) {
            return;
        }
        int index = 0;
        for (FastMenuInfo child : parent.getChildren()) {
            if (!parent.isRoot()) {
                child.setTreeGroup(parent.getTreeGroup());
            }
            if (FastStringUtils.isEmpty(child.getColor())) {
                child.setColor(parent.getColor());
            }
            if (FastStringUtils.isEmpty(child.getIconValue())) {
                child.setIconValue(parent.getIconValue());
            }
            if (FastStringUtils.isEmpty(child.getIndex())) {
                child.setIndex(String.valueOf(index));
            }
            child.resetIcon();
            pullDefault(child);
            index++;
        }
    }

    private void sortMenus(FastMenuInfo menuInfo) {
        Comparator<FastMenuInfo> comparator = new Comparator<FastMenuInfo>() {
            @Override
            public int compare(FastMenuInfo o1, FastMenuInfo o2) {
                return Integer.compare(FastNumberUtils.formatToInt(o1.getIndex()), FastNumberUtils.formatToInt(o2.getIndex()));
            }
        };
        Collections.sort(menuInfo.getChildren(), comparator);
        for (FastMenuInfo child : menuInfo.getChildren()) {
            sortMenus(child);
        }

    }

    public void notifyListener(FastMenuInfo menuInfo) {
        List<IFastMenuXmlListener> iFastMenuListeners = FastChar.getOverrides().singleInstances(false, IFastMenuXmlListener.class);
        List<FastMenuInfo> waitRemoveMenu = new ArrayList<>();
        for (FastMenuInfo child : menuInfo.getChildren()) {
            for (IFastMenuXmlListener iFastMenuListener : iFastMenuListeners) {
                if (iFastMenuListener == null) {
                    continue;
                }
                Boolean onShowMenu = iFastMenuListener.onShowMenu(child);
                if (onShowMenu == null) {
                    continue;
                }
                if (!onShowMenu) {
                    waitRemoveMenu.add(child);
                }
            }
            notifyListener(child);
        }
        menuInfo.getChildren().removeAll(waitRemoveMenu);
    }

    public FastMenuInfo getMenus() {
        if (!parsedMenuXml) {
            initMenuXml();
        }
        return menus;
    }

    public class MenuInfoHandler extends DefaultHandler {
        private final File xmlFile;
        private Locator locator;
        private final LinkedList<FastMenuInfo> linked = new LinkedList<>();

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
                menu.setLineNumber(locator.getLineNumber());
                menu.setFileName(xmlFile.getName());
                for (int i = 0; i < attributes.getLength(); i++) {
                    String attr = attributes.getQName(i);
                    String attrValue = getAttrValue(attributes, attr);
                    menu.put(attr.toLowerCase(), attrValue);
                }
                menu.setId(FastMD5Utils.MD5(linked.getLast().getId() + menu.getText()));
                menu.setParentId(linked.getLast().getId());
                menu.setIconValue(menu.getIcon());
                menu.setMethod(insertToFirstParam(menu.getMethod(), menu.getId()));
                menu.resetIcon();
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
                //do nothing
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
                        existMenu.merge(menuInfo);
                        return;
                    } else {
                        last.getChildren().add(menuInfo);
                    }
                }
                menuInfo.setLeaf(menuInfo.getChildren() == null || menuInfo.getChildren().size() == 0);
                menuInfo.validate();

            }
        }


        String getAttrValue(Attributes attributes, String attr) {
            return attributes.getValue(attr);
        }
    }

}
