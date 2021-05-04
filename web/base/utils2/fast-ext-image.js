var FastExt;
(function (FastExt) {
    /**
     * 图片相关的操作
     */
    var Image = /** @class */ (function () {
        function Image() {
        }
        /**
         * 获取oss旋转后的角度地址
         * @param imgUrl
         * @param rotate
         */
        Image.rotateOSSImgUrl = function (imgUrl, rotate) {
            if (!Ext.isEmpty(imgUrl) && !Ext.isEmpty(rotate)) {
                if (imgUrl.toString().indexOf("?") >= 0) {
                    return imgUrl + "&x-oss-process=image/rotate," + rotate;
                }
                return imgUrl + "?x-oss-process=image/rotate," + rotate;
            }
            return imgUrl;
        };
        return Image;
    }());
    FastExt.Image = Image;
})(FastExt || (FastExt = {}));
