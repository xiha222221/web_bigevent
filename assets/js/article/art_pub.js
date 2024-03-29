$(function() {
        var layer = layui.layer
        var form = layui.form
        initCate()
            // 定义加载文章分类的方法
        function initCate() {
            $.ajax({
                method: 'GET',
                url: '/my/article/cates',
                success: function(res) {
                    if (res.status !== 0) {
                        return layer.msg('获取文章分类数据失败!')
                    }
                    console.log(res);
                    // 调用模板引擎渲染分类的可选项
                    var htmlStr = template('tpl-cate', res)
                        // console.log(htmlStr);

                    $('[name=cate_id]').html(htmlStr)
                        // 一定要调用form.render()方法
                    form.render()
                }

            })
        }
        // 初始化富文本编辑器
        initEditor()
            // 1. 初始化图片裁剪器
        var $image = $('#image')
            // 2. 裁剪选项
        var options = {
                aspectRatio: 400 / 280,
                preview: '.img-preview'
            }
            // 3. 初始化裁剪区域
        $image.cropper(options)
            // 为选择封面绑定点击事件
        $('#btnChooseImage').on('click', function() {
                $('#coverFile').click()
            })
            // 监听coverFile 的change事件
        $('#coverFile').on('change', function(e) {
                // 获取到文件的列表数组
                var files = e.target.files
                    // 判断用户是否选择了文件
                if (files.length === 0) {
                    return
                }
                // 根据文件，创建对应的 URL地址
                var newImgURL = URL.createObjectURL(files[0])
                $image
                    .cropper('destroy') // 销毁旧的裁剪区域
                    .attr('src', newImgURL) // 重新设置图片路径
                    .cropper(options) // 重新初始化裁剪区域
            })
            // 定义文章发布状态
        var art_state = '已发布'
            // 为存为草稿按钮绑定点击事件
        $('#btnSave2').on('clcik', function() {
                art_state = '草稿'
            })
            //为表单绑定submit 提交事件
        $('#form-pub').on('submit', function(e) {
            e.preventDefault()
                // 基于 form 表单，快速创建一个 FormData 对象
            var fd = new FormData($(this)[0])
                // 2.将文章发布状态存到 fd 中
            fd.append('state', art_state)
                // fd.forEach(function(v, k) {
                //     console.log(k, v);
                // })

            // 3.将封面裁剪过后的图片，输出位一个文件对象
            $image
                .cropper('getCroppedCanvas', { // 创建一个 Canvas 画布
                    width: 400,
                    height: 280
                })
                .toBlob(function(blob) { // 将 Canvas 画布上的内容，转化为文件对象
                    // 得到文件对象后，进行后续的操作
                    // 4.将文件对象存储到 fd 中
                    fd.append('cover_img', blob)
                    publishArticle(fd)

                })

            // 5.发起ajax数据请求

            function publishArticle(fd) {
                $.ajax({
                    method: 'POST',
                    url: '/my/article/add',
                    data: fd,
                    // 注意：如果向服务器提交的是 FormData 格式的数据，
                    // 必须添加以下两个配置项
                    contentType: false,
                    processData: false,
                    success: function(res) {
                        if (res.status !== 0) {
                            return layer.msg('发布文章失败!')
                        }
                        layer.msg('发布文章成功!')
                            // console.log(res);

                        // 发布文章成功后跳转到文章页面
                        location.href = '/assets/article/art_list.html'

                    }
                })
            }

        })
    })
    //