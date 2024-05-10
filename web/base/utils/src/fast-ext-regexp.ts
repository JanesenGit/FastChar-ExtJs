namespace FastExt{


    export class RegExps {

        /**
         * 图片的正则表达式
         */
        static REG_BY_IMAGE: RegExp = /\.(jpg|png|gif|jpeg)$/i;
        /**
         * MP4的正则表达式
         */
        static REG_BY_MP4: RegExp = /\.(mp4)$/i;
        /**
         * Excel的正则表达式
         */
        static REG_BY_EXCEL: RegExp = /\.(xls|xlsx)$/i;

        /**
         * Word正则表达式
         */
        static REG_BY_WORD: RegExp = /\.(doc)$/i;
        /**
         * Text正则表达式
         */
        static REG_BY_TEXT: RegExp = /\.(txt)$/i;
    }

}