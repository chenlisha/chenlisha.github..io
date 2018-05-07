let loading = false; // 判断是否加载完毕  false:加载中 ture:加载完毕
let pageNumber = 1; // 当前页码数
let lastpage = false; // 是否最后一页

function drpRecHtml(rec) {
    const num = rec.myPhone && Number.parseInt(rec.myPhone) !== NaN && rec.myPhone.length === 11 ? rec.myPhone[10] : 0;

    return  `<div  class="weui-media-box weui-media-box_appmsg" style="padding: 5px 10px;">
                <div class="weui-media-box__hd" style="margin-right: 10px;">
                    <div class="person-icon-${num}">
                        <span>${rec.name[0]}</span>
                    </div>
                </div>
                <div class="weui-media-box__bd">
                    <div class="weui-cell">
                        <div class="weui-cell__bd">
                            <p class="weui-media-box__desc">
                                <span style="color:black;">${rec.name ? rec.name : '--'}</style>
                                <span style="color:gray;">(${rec.cit ? rec.cit : '--'})</style>
                            </p >
                        </div>
                        <div class="weui-cell__bd">
                            <p class="weui-media-box__desc">
                              <a style="color: gray;" href="tel:${rec.myPhone}">${rec.myPhone ? rec.myPhone : '--'}</a >
                            </p >
                        </div>
                    </div>
                    <div class="weui-cell" id="s_adcd">
                        <div class="weui-cell__bd">
                            <p class="weui-media-box__desc">
                                部门：${rec.depar ? rec.depar : '--'}
                            </p >
                        </div>
                        <div class="weui-cell__bd">
                            <p class="weui-media-box__desc">
                                职位：${rec.position ? rec.position : '--'}
                            </p >
                        </div>
                    </div>
                </div>
            </div>`;
}

function _fill_data(arrdata) { // 填充数据
    if (!arrdata) {
        return;
    }
    arrdata.forEach( (rec)=> {
        const strHtml = drpRecHtml(rec);
        $('#resultlist').append(strHtml);
    });
}

function loadData() {
    const cname = $('#cname').val();
    var urlList;
    if(cname == '' && cname == undefined){
        urlList = CONTACT_LIST
    }else{
        urlList  = CONTACT_LISTNAME
    }
    $.ajax({
        url: urlList,
        dataType: 'json',
        data:{
            pageSize: 20, // 默认每页20条记录
            pageNumber: pageNumber,
            name:cname,
        },
    }).done(function (data) {
        loading = false;
        $(".weui-loadmore").empty().append('<i class="weui-loading"></i><span class="weui-loadmore__tips">正在加载</span>').hide();
        if (Array.isArray(data.list) && data.list.length > 0) {
            _fill_data(data.list);
            if (data.lastPage) { // 最后一页时不再加载
                lastpage = true;
                $(document.body).destroyInfinite(); // 销毁加载中的插件
                if (data.totalPage > 1) {
                    $(".weui-loadmore").empty().append('<div class="weui-loadmore weui-loadmore_line"><span class="weui-loadmore__tips">暂无更多数据</span></div>').show();
                }else {
                    $('.weui-loadmore').empty().hide();
                }
            }else {
                pageNumber += 1;
            }
        }else{
            $(".weui-loadmore").empty().append('<div class="weui-loadmore weui-loadmore_line"><span class="weui-loadmore__tips">暂无数据</span></div>').show();
        }
    }).fail(function () {
        $('.weui-loadmore').hide();
        $.toptip('查询出错','error');
    });
}


function pagination() { // 滚动事件组件注册
    $(document.body).infinite().on("infinite", function() {
        if(loading){
            return;
        }
        loading = true;
        setTimeout(function() {
            loadData();
        }, 50);   // 模拟延迟
    });
}

$(function() {
    FastClick.attach(document.body);
    pagination();
    loadData();

    $('#btnSearch').click(function() {
        pageNumber = 1; // 默认显示第一页数据
        $('#resultlist').empty(); // 清空列表
        $(".weui-loadmore").empty().append('<i class="weui-loading"></i><span class="weui-loadmore__tips">正在加载</span>').show();
        if (lastpage){ // 列表加载完毕后重新注册组件
            pagination();
        }
        loadData();
    });
});
