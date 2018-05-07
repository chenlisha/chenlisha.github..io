function ImageUploader(options) {
    options = options || {};

    const allowTypes = options.allowTypes || ['image/jpg', 'image/jpeg', 'image/png'];
    const maxSize = options.maxSize || 2048 * 2048;
    const maxWidth = options.maxWidth || 2000;
    const maxCount = options.maxCount || 10;
    const selector = options.selector || '#uploaderInput';
    const fnUpload = options.fnUpload;
    const fnDelete = options.fnDelete;

    const imgFiles = {};

    function getFileCount() {
        let count = 0;
        for (let key in imgFiles) {
            if (imgFiles.hasOwnProperty(key) && imgFiles[key]) {
                count += 1;
            }
        }
        return count;
    }

    this.getFiles = function () {
        let ret = [];
        for (let key in imgFiles) {
            if (imgFiles.hasOwnProperty(key) && imgFiles[key]) {
                ret.push({
                    uuid: key,
                    file: imgFiles[key],
                });
            }
        }
        return ret;
    }

    $(selector).on('change', function(event) {
        let files = event.target.files;
        if (files.length === 0) {
            return;
        }

        let curCount = getFileCount();
        if (curCount + files.length > maxCount){
            $.alert('最多只能上传' + maxCount + '张图片',"警告！");
            const _files = [];
            for (let i = curCount; i < maxCount; i += 1){
                _files[i] = files[i];
            }
            files = _files;
        }

        for (let ifile = 0; ifile < files.length; ifile += 1) {
            const file = files[ifile];
            if (allowTypes.indexOf(file.type) === -1) {
                $.alert("该类型不允许上传！", "警告！");
                continue;
            }
            if (file.size > maxSize) {
                $.alert("图片太大，不允许上传", "警告！");
                continue;
            }

            const fileObjName = _cutil.guid().split('-').join('');
            imgFiles[fileObjName] = file;

            const $picDiv = $(`<li class="weui-uploader__file" style="background-image: url('${URL.createObjectURL(file)}')">
                <div><img src="../../image/shanchu.png" class="del_${fileObjName}" style="width: 24px; height: 24px; float: right; background: #ccc"/></div></li>`);
            $('#uploaderFiles').append($picDiv);

            if (fnUpload) {
                fnUpload(fileObjName, file);
            }

            $picDiv.on('click', `.del_${fileObjName}`, function () {
                let thisDiv = this;
                $.confirm("您确定要删除吗?", "确认删除?", function() {
                    delete imgFiles[fileObjName];
                    $(thisDiv).parents('li').remove();
                    if (fnDelete) {
                        fnDelete(fileObjName);
                    }
                });
            });
            const num = $('.weui-uploader__file').length;
            $('.weui-uploader__info').text(`${getFileCount()}/${maxCount}`);
        }
    });
}