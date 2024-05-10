package com.fastchar.extjs.databoard;

import com.fastchar.extjs.entity.ExtManagerEntity;
import com.fastchar.extjs.entity.ExtSystemDataEntity;
import com.fastchar.utils.FastDateUtils;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class FastDataboardJob {

    private static String LAST_RUN_DATE = "";
    private static boolean STARTED_JOB = false;

    public synchronized static void startJob() {
        if (STARTED_JOB) {
            return;
        }
        STARTED_JOB = true;
        ScheduledExecutorService scheduledThreadPool = Executors.newSingleThreadScheduledExecutor();

        scheduledThreadPool.scheduleAtFixedRate(() -> {
            Calendar instance = Calendar.getInstance();
            int hour = instance.get(Calendar.HOUR_OF_DAY);
            String date = FastDateUtils.format(instance.getTime(), "yyyy-MM-dd");
            if (LAST_RUN_DATE.equalsIgnoreCase(date)) {
                return;
            }
            if (hour == 2) {
                //凌晨两点执行
                saveYesterdayData();
                LAST_RUN_DATE = date;
            }
        }, 1, 15, TimeUnit.MINUTES);//15分钟检测一次
    }


    public static void saveYesterdayData() {
        saveYesterdayData(1);
    }


    public static void saveYesterdayData(int dateRang) {
        Calendar instance = Calendar.getInstance();
        for (int i = 0; i < dateRang; i++) {
            instance.add(Calendar.DATE, -1);
            List<ExtManagerEntity> select = ExtManagerEntity.dao().select();
            for (ExtManagerEntity extManagerEntity : select) {
                ExtSystemDataEntity.dao().saveData(extManagerEntity, instance.getTime());
            }
        }
    }
}
