namespace FastExt{

    /**
     * 图片相关的操作
     */
    export class Image{

        private constructor() {
        }

        /**
         * 获取oss旋转后的角度地址
         * @param imgUrl
         * @param rotate
         */
        static rotateOSSImgUrl(imgUrl, rotate) {
            if (!Ext.isEmpty(imgUrl) && !Ext.isEmpty(rotate)) {
                if (imgUrl.toString().indexOf("?") >= 0) {
                    return imgUrl + "&x-oss-process=image/rotate," + rotate;
                }
                return imgUrl + "?x-oss-process=image/rotate," + rotate;
            }
            return imgUrl;
        }
    }

}