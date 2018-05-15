const  = _cutil.QueryString();

let loading = false; // 判断是否加载完毕  false:加载中 ture:加载完毕
let pageNumber = 1; // 当前页码数
let lastpage = false; // 是否最后一页
const TmSelector = new _TmSelector();
let st = null; // 起始时间
let et = null; // 结束时间

function _TmSelector() {
    let tm = new Date();
    this.getStrTm1 = function () {
        return _cutil.formatDate(new Date(tm.getTime() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    };
    this.getStrTm2 = function () {
        return _cutil.formatDate(tm, 'yyyy-MM-dd')
    };
    this.setTm = function (val) {
        if (typeof val === 'string') {
            tm = new Date(val);
        } else if (tm) {
            tm = val;
        }
    }
}

function init() { // 初始化时间
    $('#s_tm').val(TmSelector.getStrTm1());
    $('#e_tm').val(TmSelector.getStrTm2());
}

function resultRecHtml(rec) {
    const straname = rec.stnm ? rec.stnm: '';
    const strtm = _cutil.formatDate(rec.patrol_tm, 'yyyy-MM-dd hh:mm');

    return `<a class="weui-media-box weui-media-box_appmsg">
                <div class="weui-media-box__bd">
                    <div class="weui-media-box__title">${straname}</div>
                    
                    <div class="weui-cell__bd">
                        <p class="weui-media-box__desc">
                            时间：${strtm}　
                            巡检人：${rec.patrol_username}
                        </p>
                    </div>
                    <p class="weui-media-box__desc" style="margin-top:5px;font-size: 15px;">
                        [巡检内容]: ${rec.patrol_content}
                    </p>
                </div>
            </a>`;
}

function _fill_data(arrdata) { // 填充数据
    if (!arrdata) {
        return;
    }
    arrdata.forEach( (rec)=> {
        const strHtml = resultRecHtml(rec);
        $('#resultlist').append(strHtml);
    });
}

function loadData() {
    st = $('#s_tm').val();
    et = $('#e_tm').val();
    if (!st || !et) {
        $.toptip('时间不能为空','warning');
        loading = true;
        return;
    }
    let _st = Date.parse(st);
    let _et = Date.parse(et);
    if (_st > new Date().getTime()) {
        st = _cutil.formatDate(new Date(), 'yyyy-MM-dd');
        _st = Date.parse(st);
        $('#s_tm').val(st);
    }
    if (_et > new Date().getTime()) {
        et = _cutil.formatDate(new Date(), 'yyyy-MM-dd');
        _et = Date.parse(et);
        $('#e_tm').val(et);
    }
    if (_st > _et) {
        et = _cutil.formatDate(new Date(_st), 'yyyy-MM-dd');
        $('#e_tm').val(et);
    }

    $.ajax({
        url: ROOT_SERVICE + '/patrol/listp',
        data: {
            pageSize: 10,
            pageNumber: 1,
            search: [
                ['patrol_tm','>=',`${st} 00:00:00`],
                ['patrol_tm','<=',`${et} 23:59:59`],
                ['patrol_userid', '=', theUserObj.theUser],
            ],
            sort: ['patrol_tm', 'desc'],
        },
    }).done(function(data) {
        loading = false;
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
            } else {
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

    _cutil.wxlogin(PATROL_LOGIN, "patrol", .code, function (userObj) {
        theUserObj = userObj;

        init();
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
});
