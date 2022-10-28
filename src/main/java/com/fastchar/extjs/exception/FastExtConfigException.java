package com.fastchar.extjs.exception;

public class FastExtConfigException extends RuntimeException {
    public FastExtConfigException(String message) {
        super(message);
    }

    public FastExtConfigException() {
        super();
    }

    public FastExtConfigException(String message, Throwable cause) {
        super(message, cause);
    }

    public FastExtConfigException(Throwable cause) {
        super(cause);
    }

    protected FastExtConfigException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
