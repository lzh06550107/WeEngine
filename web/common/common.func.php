<?php
/**
 * [WeEngine System] Copyright (c) 2014 WE7.CC
 * WeEngine is NOT a free software, it under the license terms, visited http://www.we7.cc/ for more details.
 */
defined('IN_IA') or exit('Access Denied');

load()->model('module');

/**
 * 生成URL，统一生成方便管理
 * @param string $segment 路由信息字符串，eg：{$controller}/{$action}[/{$do}]
 * @param array $params queryString 参数
 * @return string eg:(./index.php?c=*&a=*&do=*&...)
 */
function url($segment, $params = array())
{
    return wurl($segment, $params);
}

/**
 * 页面执行中断并跳转到消息提示页面。
 *
 * @param string $msg
 * 提示消息内容
 *
 * @param string $redirect
 * 跳转地址，可缺省，如果没有指定则返回网页显示消息；如果指定则使用消息框显示消息。
 * <pre>
 * null 缺省，不进行跳转。
 * refresh 显示 message 页面后，重新跳转到当前执行的页面
 * referer 显示 message 页面后，回退到当前执行页面的上一页面
 * $url string 跳转到指定页面
 * </pre>
 * @param string $type 提示类型，取值不同，消息页面呈现不同效果。
 * <pre>
 * success  成功
 * error	错误
 * info	 提示(灯泡)
 * warning  警告(叹号)
 * ajax	 json 不跳转到 message 页面，但是页面输出 json
 * sql
 * </pre>
 * @param boolean $tips 是否是以tips形式展示（兼容1.0之前版本该函数的页面展示形式）
 *
 * @param array $extend 扩展按钮,支持多按钮
 * title string 扩展按钮名称
 * url string 跳转链接
 */
function message($msg, $redirect = '', $type = '', $tips = false, $extend = array())
{
    global $_W, $_GPC;

    if ($redirect == 'refresh') { // 如果是刷新
        $redirect = $_W['script_name'] . '?' . $_SERVER['QUERY_STRING'];
    }
    if ($redirect == 'referer') { // 如果是上一个页面
        $redirect = referer();
    }
    // 跳转链接只能跳转本域名下 防止钓鱼 如: 用户可能正常从信任站点微擎登录 跳转到第三方网站 会误认为第三方网站也是安全的
    $redirect = safe_gpc_url($redirect);

    if ($redirect == '') {
        $type = in_array($type, array('success', 'error', 'info', 'warning', 'ajax', 'sql')) ? $type : 'info';
    } else {
        $type = in_array($type, array('success', 'error', 'info', 'warning', 'ajax', 'sql')) ? $type : 'success';
    }
    // 如果是ajax请求或者直接指定是ajax类型
    if ($_W['isajax'] || !empty($_GET['isajax']) || $type == 'ajax') {
        if ($type != 'ajax' && !empty($_GPC['target'])) {
            exit("
<script type=\"text/javascript\">
	var url = " . (!empty($redirect) ? 'parent.location.href' : "''") . ";
	var modalobj = util.message('" . $msg . "', '', '" . $type . "');
	if (url) {
		modalobj.on('hide.bs.modal', function(){\$('.modal').each(function(){if(\$(this).attr('id') != 'modal-message') {\$(this).modal('hide');}});top.location.reload()});
	}
</script>");
        } else {
            $vars = array();
            $vars['message'] = $msg;
            $vars['redirect'] = $redirect;
            $vars['type'] = $type;
            exit(json_encode($vars)); // ajax请求以json格式返回数据
        }
    }
    // 直接重定向
    if (empty($msg) && !empty($redirect)) {
        header('Location: ' . $redirect);
        exit;
    }
    $label = $type;
    if ($type == 'error') {
        $label = 'danger';
    }
    if ($type == 'ajax' || $type == 'sql') {
        $label = 'warning';
    }

    if ($tips) {
        if (is_array($msg)) {
            $message_cookie['title'] = 'MYSQL 错误';
            $message_cookie['msg'] = 'php echo cutstr(' . $msg['sql'] . ', 300, 1);';
        } else {
            $message_cookie['title'] = $caption;
            $message_cookie['msg'] = $msg;
        }
        $message_cookie['type'] = $label;
        $message_cookie['redirect'] = $redirect ? $redirect : referer();
        $message_cookie['msg'] = rawurlencode($message_cookie['msg']);
        $extend_button = array();
        if (!empty($extend) && is_array($extend)) {
            foreach ($extend as $button) {
                if (!empty($button['title']) && !empty($button['url'])) {
                    $button['url'] = safe_gpc_url($button['url']);
                    $button['title'] = rawurlencode($button['title']);
                    $extend_button[] = $button;
                }
            }
        }
        $message_cookie['extend'] = !empty($extend_button) ? $extend_button : '';
        // 保存消息到cookie中
        isetcookie('message', stripslashes(json_encode($message_cookie, JSON_UNESCAPED_UNICODE)));
        if (!empty($message_cookie['redirect'])) { // 然后通过重定向把消息传输到下一个请求中，下一个请求脚本会读取cookie信息并显示
            header('Location: ' . $message_cookie['redirect']);
        } else { // 没有指定$redirect则直接返回网页显示消息
            include template('common/message', TEMPLATE_INCLUDEPATH);
        }
    } else {// 没有指定$redirect则直接返回网页显示消息
        include template('common/message', TEMPLATE_INCLUDEPATH);
    }
    exit;
}

/**
 * 返回json格式消息
 * @param int $code 错误码
 * @param string $message 消息内容
 * @param string $redirect 重定向的地址，referer表示前一个页面；refresh表示当前页面刷新
 */
function iajax($code = 0, $message = '', $redirect = '')
{
    message(error($code, $message), $redirect, 'ajax', false);
}

/**
 * Toast 在屏幕下方浮现出一个窗口,显示一段时间后又消失
 * @param $message 消息内容
 * @param string $redirect 重定向的地址，referer表示前一个页面；refresh表示当前页面刷新
 * @param string $type 提示类型
 * @param array $extend 指定按钮的标题和url
 */
function itoast($message, $redirect = '', $type = '', $extend = array())
{
    message($message, $redirect, $type, true, $extend);
}

/**
 * 验证操作用户是否已登录
 *
 * @return boolean
 */
function checklogin()
{
    global $_W;
    if (empty($_W['uid'])) {
        // 如果没有登录且设置首页(在站点->站点设置->是否显示首页中设置)，则跳转到首页
        if (!empty($_W['setting']['copyright']['showhomepage'])) {
            itoast('', url('account/welcome'), 'warning');
        } else { // 否则跳转到登录页面
            itoast('', url('user/login'), 'warning');
        }
    }
    return true;
}

/**
 * 构建菜单
 * @param string $framename
 * @return array|bool|Memcache|mixed|Redis|string
 */
function buildframes($framename = '')
{
    global $_W, $_GPC, $top_nav; // 通过全局返回顶层菜单项
    // ？？
    if (!empty($GLOBALS['frames']) && !empty($_GPC['m'])) {
        $frames = array();
        $globals_frames = (array)$GLOBALS['frames'];
        foreach ($globals_frames as $key => $row) {
            if (empty($row)) continue;
            $row = (array)$row;
            $frames['section']['platform_module_menu' . $key]['title'] = $row['title'];
            if (!empty($row['items'])) {
                foreach ($row['items'] as $li) {
                    $frames['section']['platform_module_menu' . $key]['menu']['platform_module_menu' . $li['id']] = array(
                        'title' => "<i class='wi wi-appsetting'></i> {$li['title']}",
                        'url' => $li['url'],
                        'is_display' => 1,
                    );
                }
            }
        }
        return $frames;
    }
    $frames = cache_load('system_frame'); // 系统配置框架
    if (empty($frames)) {
        $frames = cache_build_frame_menu(); // 构建窗体菜单并缓存
    }

    $modules = uni_modules(false); // 获取指定统一帐号下所有模块，包括系统模块
    $sysmodules = system_modules(); // 获取所有系统模块标识
    // 如果用户在当前统一帐号存在权限
    $status = permission_account_user_permission_exist($_W['uid'], $_W['uniacid']);
    // 1、非创始人"应用模块"菜单。如果用户不是创始人也不是拥有者且配置了限制权限
    if (!$_W['isfounder'] && $status && $_W['role'] != ACCOUNT_MANAGE_NAME_OWNER) {
        // 获取指定账号的指定用户的所有模块和站点的权限
        $module_permission = permission_account_user_menu($_W['uid'], $_W['uniacid'], 'modules');
        if (!is_error($module_permission) && !empty($module_permission)) {
            foreach ($module_permission as $module) { // 指定用户指定统一账号下可用模块
                // 如果模块是系统模块且是主模块而且支持公众号
                if (!in_array($module['type'], $sysmodules) && empty($modules[$module['type']]['main_module']) && $modules[$module['type']]['app_support'] == 2) {
                    $module = $modules[$module['type']]; // 获取该模块
                    if (!empty($module)) { // 给应用模块区域添加模块菜单项
                        $frames['account']['section']['platform_module']['menu']['platform_' . $module['name']] = array(
                            'title' => $module['title'],
                            'icon' => $module['logo'],
                            'url' => url('home/welcome/ext', array('m' => $module['name'])),
                            'is_display' => 1,
                        );
                    }
                }
            }
        } else { // 如果出错，则不显示应用模块区域
            $frames['account']['section']['platform_module']['is_display'] = false;
        }
    } else { // 2、创始人"应用模块"菜单项。如果用户是创始人，或者没有配置限制权限，或者用户是统一帐号拥有者
        // 获取指定统一帐号下可在菜单下显示的模块标识列表
        $account_module = pdo_getall('uni_account_modules', array('uniacid' => $_W['uniacid'], 'shortcut' => STATUS_ON), array('module'), '', 'displayorder DESC, id DESC');
        if (!empty($account_module)) {
            foreach ($account_module as $module) {
                if (!in_array($module['module'], $sysmodules)) { // 如果不是系统模块
                    $module = module_fetch($module['module']); // 获取模块信息
                    // 如果模块存在且属于该统一帐号且为主模块且支持公众号或者支持pc
                    if (!empty($module) && !empty($modules[$module['name']]) && empty($module['main_module']) && ($module['app_support'] == 2 || $module['webapp_support'] == 2)) { // 添加到公众号应用模块菜单
                        $frames['account']['section']['platform_module']['menu']['platform_' . $module['name']] = array(
                            'title' => $module['title'],
                            'icon' => $module['logo'],
                            'url' => url('home/welcome/ext', array('m' => $module['name'])),
                            'is_display' => 1,
                        ); // 添加到PC应用模块菜单
                        $frames['webapp']['section']['platform_module']['menu']['platform_' . $module['name']] = array(
                            'title' => $module['title'],
                            'icon' => $module['logo'],
                            'url' => url('home/welcome/ext', array('m' => $module['name'])),
                            'is_display' => 1,
                        );
                    }
                }
            }
        } elseif (!empty($modules)) { // 如果指定统一帐号下存在模块

            if (user_is_vice_founder()) {
                $modules = uni_modules_by_uniacid($_W['uniacid']);
                $user_module = user_modules($_W['uid']);
                $modules = array_intersect_assoc($modules, $user_module);
            }

            $new_modules = array_reverse($modules);
            $i = 0;
            foreach ($new_modules as $module) {
                // 如果模块是系统模块或者模块支持小程序或者APP应用或者PC应用，则忽略
                if (!empty($module['issystem']) || $module['wxapp_support'] == 2 || $module['phoneapp_support'] == 2 || $module['webapp_support'] == 2) {
                    continue;
                }
                if ($i == 5) { // 最多生成5个模块菜单项
                    break;
                }
                // 添加模块菜单项
                $frames['account']['section']['platform_module']['menu']['platform_' . $module['name']] = array(
                    'title' => $module['title'],
                    'icon' => $module['logo'],
                    'url' => url('home/welcome/ext', array('m' => $module['name'])),
                    'is_display' => 1,
                );
                $i++;
            }
        }
        if (array_diff(array_keys($modules), $sysmodules)) { // 存在非系统模块，则显示更多应用菜单
            $frames['account']['section']['platform_module']['menu']['platform_module_more'] = array(
                'title' => '更多应用',
                'url' => url('module/manage-account'),
                'is_display' => 1,
            );
            $frames['webapp']['section']['platform_module']['menu']['platform_module_more'] = array(
                'title' => '更多应用',
                'url' => url('webapp/home/display'),
                'is_display' => 1,
            );
        } else {// 如果不存在，则不显示应用模块区域
            $frames['account']['section']['platform_module']['is_display'] = false;
        }
    } //end 创始人应用模块菜单项

    //从数据库中获取用户权限，并附加上预置的对应角色菜单项
    //仅当 "系统菜单" 时才使用预设权限
    if (!empty($_W['role']) && !user_is_founder($_W['uid'])) { // 创始人包括主创始人和副创始人
        $user_permission = permission_account_user('system'); // 公众号加上系统菜单预设权限
    }
    if (empty($_W['role']) && empty($_W['uniacid'])) {
        $user_permission = permission_account_user('system');
    }

    if (!empty($user_permission)) { // 如果用户具有权限
        foreach ($frames as $nav_id => $section) {
            if (empty($section['section'])) { // 如果没有区域，则忽略
                continue;
            }
            foreach ($section['section'] as $section_id => $secion) {
                if ($nav_id == 'account') { // 如果是公众号菜单
                    // 如果用户在当前统一帐号存在权限且
                    // 指定账号的指定用户的所有模块和站点的权限且
                    // 用户具有所有公众号权限且
                    // 区域菜单不是应用模块且
                    // 指定统一帐号下指定用户角色不是拥有者
                    if ($status && !empty($module_permission) && in_array("account*", $user_permission) && $section_id != 'platform_module' && permission_account_user_role($_W['uid'], $_W['uniacid']) != ACCOUNT_MANAGE_NAME_OWNER) {
                        $frames['account']['section'][$section_id]['is_display'] = false; // 不显示该区域
                        continue;
                    } else { // 否则显示
                        if (in_array("account*", $user_permission)) {
                            continue;
                        }
                    }
                }

                if ($nav_id != 'wxapp' && $nav_id != 'store') {
                    $section_show = false;
                    $secion['if_fold'] = !empty($_GPC['menu_fold_tag:' . $section_id]) ? 1 : 0; // 是否展开区域菜单
                    foreach ($secion['menu'] as $menu_id => $menu) { // 如果用户不具有该菜单项权限且区域不是应用模块，则隐藏菜单项
                        if (!in_array($menu['permission_name'], $user_permission) && $section_id != 'platform_module') {
                            $frames[$nav_id]['section'][$section_id]['menu'][$menu_id]['is_display'] = false;
                        } else {
                            $section_show = true;
                        }
                    }
                    // 没有设置区域是否显示，则
                    if (!isset($frames[$nav_id]['section'][$section_id]['is_display'])) {
                        $frames[$nav_id]['section'][$section_id]['is_display'] = $section_show;
                    }
                }

            }
        }
    } else { // 如果用户没有权限
        if (user_is_vice_founder()) { // 则查看用户角色是否是副创始人，如果是则隐藏一些菜单
            $frames['system']['section']['article']['is_display'] = false;
            $frames['system']['section']['welcome']['is_display'] = false;
            $frames['system']['section']['wxplatform']['menu']['system_platform']['is_display'] = false;
            $frames['system']['section']['user']['menu']['system_user_founder_group']['is_display'] = false; // 副创始人管理菜单
        }
    }

    //进入某个模块界面后菜单构建

    $modulename = trim($_GPC['m']);
    $eid = intval($_GPC['eid']); // 模块绑定表中主键
    $version_id = intval($_GPC['version_id']);
    // 非系统模块
    if ((!empty($modulename) || !empty($eid)) && !in_array($modulename, system_modules())) {
        if (!empty($eid)) {
            $entry = pdo_get('modules_bindings', array('eid' => $eid));
        }
        if (empty($modulename)) {
            $modulename = $entry['module'];
        }
        $module = module_fetch($modulename); // 获取模块信息
        $entries = module_entries($modulename); // 模块的所有类型的入口地址
        if ($status) { // 如果用户在当前统一帐号存在权限
            // 获取指定统一帐号下，指定用户名称，指定模块的用户权限
            $permission = pdo_get('users_permission', array('uniacid' => $_W['uniacid'], 'uid' => $_W['uid'], 'type' => $modulename), array('permission'));
            if (!empty($permission)) {
                $permission = explode('|', $permission['permission']);
            } else {
                $permission = array('account*'); // 如果权限为空，则默认具有所有权限
            }
            if ($permission[0] != 'all') { // 判断是否具有如下权限
                if (!in_array($modulename . '_rule', $permission)) {
                    unset($module['isrulefields']);
                }
                if (!in_array($modulename . '_settings', $permission)) {
                    unset($module['settings']);
                }
                if (!in_array($modulename . '_permissions', $permission)) {
                    unset($module['permissions']);
                }
                if (!in_array($modulename . '_home', $permission)) {
                    unset($entries['home']);
                }
                if (!in_array($modulename . '_profile', $permission)) {
                    unset($entries['profile']);
                }
                if (!in_array($modulename . '_shortcut', $permission)) {
                    unset($entries['shortcut']);
                }
                if (!empty($entries['cover'])) {
                    foreach ($entries['cover'] as $k => $row) {
                        if (!in_array($modulename . '_cover_' . $row['do'], $permission)) {
                            unset($entries['cover'][$k]);
                        }
                    }
                }
                if (!empty($entries['menu'])) {
                    foreach ($entries['menu'] as $k => $row) {
                        if (!in_array($modulename . '_menu_' . $row['do'], $permission)) {
                            unset($entries['menu'][$k]);
                        }
                    }
                }
            }
        }

        $frames['account']['section'] = array(); // 注意模块后台菜单也是account
        /**
         * 应用入口菜单，如果自动回复规则开启，则使用自动规则，否则使用微站功能封面第一个配置
         */
        if ($module['isrulefields'] || !empty($entries['cover']) || !empty($entries['mine'])) {
            if (!empty($module['isrulefields']) && !empty($_W['account']) && in_array($_W['account']['type'], array(ACCOUNT_TYPE_OFFCIAL_NORMAL, ACCOUNT_TYPE_OFFCIAL_AUTH))) {
                $url = url('platform/reply', array('m' => $modulename, 'version_id' => $version_id));
            }
            if (empty($url) && !empty($entries['cover'])) {
                $url = url('platform/cover', array('eid' => $entries['cover'][0]['eid'], 'version_id' => $version_id));
            }
            $frames['account']['section']['platform_module_common']['menu']['platform_module_entry'] = array(
                'title' => "<i class='wi wi-reply'></i> 应用入口",
                'url' => $url,
                'is_display' => 1,
            );
        }
        // 参数设置菜单
        if ($module['settings']) {
            $frames['account']['section']['platform_module_common']['menu']['platform_module_settings'] = array(
                'title' => "<i class='fa fa-cog'></i> 参数设置",
                'url' => url('module/manage-account/setting', array('m' => $modulename, 'version_id' => $version_id)),
                'is_display' => 1,
            );
        }
        // 如果模块设置权限字段且用户是创始人或者统一帐号拥有者，则需要权限设置菜单
        if ($module['permissions'] && ($_W['isfounder'] || $_W['role'] == ACCOUNT_MANAGE_NAME_OWNER)) {
            $frames['account']['section']['platform_module_common']['menu']['platform_module_permissions'] = array(
                'title' => "<i class='fa fa-cog'></i> 权限设置",
                'url' => url('module/permission', array('m' => $modulename, 'version_id' => $version_id)),
                'is_display' => 1,
            );
        }
        // 如果是创始人或者统一帐号拥有者，则需要设置默认入口菜单
        if ($_W['isfounder'] || $_W['role'] == ACCOUNT_MANAGE_NAME_OWNER) {
            $frames['account']['section']['platform_module_common']['menu']['platform_module_default_entry'] = array(
                'title' => "<i class='fa fa-cog'></i> 默认入口",
                'url' => url('module/default-entry', array('m' => $modulename, 'version_id' => $version_id)),
                'is_display' => 1,
            );
        }
        // 如果设置微站首页导航且统一帐号是公众号，则需要
        if ($entries['home'] && !empty($_W['account']) && in_array($_W['account']['type'], array(ACCOUNT_TYPE_OFFCIAL_NORMAL, ACCOUNT_TYPE_OFFCIAL_AUTH))) {
            $frames['account']['section']['platform_module_common']['menu']['platform_module_home'] = array(
                'title' => "<i class='fa fa-home'></i> 微站首页导航",
                'url' => url('site/nav/home', array('m' => $modulename, 'version_id' => $version_id)),
                'is_display' => 1,
            );
        }
        // 如果设置微站个人中心导航且统一帐号是公众号，则需要
        if ($entries['profile'] && !empty($_W['account']) && in_array($_W['account']['type'], array(ACCOUNT_TYPE_OFFCIAL_NORMAL, ACCOUNT_TYPE_OFFCIAL_AUTH))) {
            $frames['account']['section']['platform_module_common']['menu']['platform_module_profile'] = array(
                'title' => "<i class='fa fa-user'></i> 个人中心导航",
                'url' => url('site/nav/profile', array('m' => $modulename, 'version_id' => $version_id)),
                'is_display' => 1,
            );
        }
        // 如果设置微站快捷功能导航且统一帐号是公众号，则需要
        if ($entries['shortcut'] && !empty($_W['account']) && in_array($_W['account']['type'], array(ACCOUNT_TYPE_OFFCIAL_NORMAL, ACCOUNT_TYPE_OFFCIAL_AUTH))) {
            $frames['account']['section']['platform_module_common']['menu']['platform_module_shortcut'] = array(
                'title' => "<i class='fa fa-plane'></i> 快捷菜单",
                'url' => url('site/nav/shortcut', array('m' => $modulename, 'version_id' => $version_id)),
                'is_display' => 1,
            );
        }
        // 微站功能封面
        if (!empty($entries['cover'])) {
            foreach ($entries['cover'] as $key => $menu) {
                $frames['account']['section']['platform_module_common']['menu']['platform_module_cover'][] = array(
                    'title' => "{$menu['title']}",
                    'url' => url('platform/cover', array('eid' => $menu['eid'], 'version_id' => $version_id)),
                    'is_display' => 0, // 不显示
                );
            }
        }
        // 业务菜单
        if (!empty($entries['menu'])) {
            $frames['account']['section']['platform_module_menu']['title'] = '业务菜单';
            foreach ($entries['menu'] as $key => $row) {
                if (empty($row)) continue;
                foreach ($row as $li) {
                    $frames['account']['section']['platform_module_menu']['menu']['platform_module_menu' . $row['eid']] = array(
                        'title' => "<i class='wi wi-appsetting'></i> {$row['title']}",
                        'url' => $row['url'] . '&version_id=' . $version_id,
                        'is_display' => 1,
                    );
                }
            }
        }
        // 当前模块存在插件列表或者存在主模块
        if (!empty($module['plugin_list']) || !empty($module['main_module'])) {
            if (!empty($module['main_module'])) {
                $main_module = module_fetch($module['main_module']);
                $plugin_list = $main_module['plugin_list'];
            } else {
                $plugin_list = $module['plugin_list'];
            }
            $plugin_list = array_intersect($plugin_list, array_keys($modules));
            if (!empty($plugin_list)) {
                // 生成模块插件菜单
                $frames['account']['section']['platform_module_menu']['plugin_menu'] = array(
                    'main_module' => !empty($main_module) ? $main_module['name'] : $module['name'],
                    'title' => !empty($main_module) ? $main_module['title'] : $module['title'],
                    'icon' => !empty($main_module) ? $main_module['logo'] : $module['logo'],
                    'menu' => array()
                );
                foreach ($plugin_list as $plugin) { // 创建每个插件的菜单项
                    $frames['account']['section']['platform_module_menu']['plugin_menu']['menu'][$modules[$plugin]['name']] = array(
                        'title' => $modules[$plugin]['title'],
                        'icon' => $modules[$plugin]['logo'],
                        'url' => url('home/welcome/ext', array('m' => $plugin, 'version_id' => $version_id)),
                    );
                }
            }
        }

        // 如果存在微擎后台首页，则构建菜单项
        if (!empty($entries['system_welcome']) && $_W['isfounder']) {
            $frames['account']['section']['platform_module_welcome']['title'] = '';
            foreach ($entries['system_welcome'] as $key => $row) {
                if (empty($row)) continue;
                $frames['account']['section']['platform_module_welcome']['menu']['platform_module_welcome' . $row['eid']] = array(
                    'title' => "<i class='wi wi-appsetting'></i> {$row['title']}",
                    'url' => $row['url'],
                    'is_display' => 1,
                );
            }
        }

    }

    // 微信小程序菜单构建

    if (FRAME == 'wxapp') {
        load()->model('wxapp');
        $version_id = intval($_GPC['version_id']);
        $wxapp_version = wxapp_version($version_id);
        if (!empty($wxapp_version['modules'])) {
            foreach ($wxapp_version['modules'] as $module) {
                $wxapp_module_permission = permission_account_user_menu($_W['uid'], $_W['uniacid'], $module['name']);
                if (empty($wxapp_module_permission)) {
                    $frames['wxapp']['section']['wxapp_module']['is_display'] = false;
                    break;
                }
                $frames['wxapp']['section']['wxapp_module']['menu']['module_menu' . $module['mid']] = array(
                    'title' => "<img src='{$module['logo']}'> {$module['title']}",
                    'url' => url('wxapp/display/switch', array('module' => $module['name'], 'version_id' => $version_id)),
                    'is_display' => 1,
                );
            }
        } else {
            $frames['wxapp']['section']['wxapp_module']['is_display'] = false;
        }

        if (!empty($frames['wxapp']['section'])) {
            $wxapp_permission = permission_account_user('wxapp');
            foreach ($frames['wxapp']['section'] as $wxapp_section_id => $wxapp_section) {
                if ($status && !empty($wxapp_permission) && in_array("wxapp*", $wxapp_permission) && $wxapp_section_id != 'wxapp_module' && $role != ACCOUNT_MANAGE_NAME_OWNER) {
                    $frames['wxapp']['section'][$wxapp_section_id]['is_display'] = false;
                    continue;
                }
                if (!empty($wxapp_section['menu']) && $wxapp_section_id != 'wxapp_module') {
                    foreach ($wxapp_section['menu'] as $wxapp_menu_id => $wxapp_menu) {
                        if ($wxapp_section_id == 'wxapp_profile' || $wxapp_section_id == 'wxapp_entrance') {
                            $frames['wxapp']['section'][$wxapp_section_id]['menu'][$wxapp_menu_id]['url'] .= 'version_id=' . $version_id;
                        }
                        if (!in_array('wxapp*', $wxapp_permission) && !in_array($wxapp_menu['permission_name'], $wxapp_permission)) {
                            $frames['wxapp']['section'][$wxapp_section_id]['menu'][$wxapp_menu_id]['is_display'] = false;
                        }
                    }
                }
            }
        }
    }

    // APP菜单构建

    if (FRAME == 'phoneapp') {
        load()->model('phoneapp');
        $version_id = intval($_GPC['version_id']);
        $phoneapp_version = phoneapp_version($version_id);
        if (!empty($phoneapp_version['modules'])) {
            foreach ($phoneapp_version['modules'] as $module) {
                $phoneapp_module_permission = permission_account_user_menu($_W['uid'], $_W['uniacid'], $module['name']);
                if (empty($phoneapp_module_permission)) {
                    $frames['phoneapp']['section']['phoneapp_module']['is_display'] = false;
                    break;
                }
                $frames['phoneapp']['section']['phoneapp_module']['menu']['module_menu' . $module['mid']] = array(
                    'title' => "<img src='{$module['logo']}'> {$module['title']}",
                    'url' => url('phoneapp/display/switch', array('module' => $module['name'], 'version_id' => $version_id)),
                    'is_display' => 1,
                );
            }
        } else {
            $frames['phoneapp']['section']['platform_module']['menu']['platform_module_more'] = array(
                'title' => '更多应用',
                'url' => url('phoneapp/description'),
                'is_display' => 1,
            );
        }

        if (!empty($frames['phoneapp']['section'])) {
            $phoneapp_permission = permission_account_user('phoneapp');
            foreach ($frames['phoneapp']['section'] as $phoneapp_section_id => $phoneapp_section) {
                if ($status && !empty($phoneapp_permission) && in_array("phoneapp*", $phoneapp_permission) && $phoneapp_section_id != 'phoneapp_module' && $role != ACCOUNT_MANAGE_NAME_OWNER) {
                    $frames['phoneapp']['section'][$phoneapp_section_id]['is_display'] = false;
                    continue;
                }
                if (!empty($phoneapp_section['menu']) && $phoneapp_section_id != 'phoneapp_module') {
                    foreach ($phoneapp_section['menu'] as $phoneapp_menu_id => $phoneapp_menu) {
                        if ($phoneapp_section_id == 'phoneapp_profile' || $phoneapp_section_id == 'phoneapp_entrance') {
                            $frames['phoneapp']['section'][$phoneapp_section_id]['menu'][$phoneapp_menu_id]['url'] .= 'version_id=' . $version_id;
                        }
                        if (!in_array('phoneapp*', $phoneapp_permission) && !in_array($phoneapp_menu['permission_name'], $phoneapp_permission)) {
                            $frames['phoneapp']['section'][$phoneapp_section_id]['menu'][$phoneapp_menu_id]['is_display'] = false;
                        }
                    }
                }
            }
        }
    }

    foreach ($frames as $menuid => $menu) {

        // 副创始人去掉site顶级菜单
        if (!empty($menu['founder']) && empty($_W['isfounder']) ||
            is_array($_W['setting']['store']['blacklist']) && in_array($_W['username'], $_W['setting']['store']['blacklist']) && !empty($_W['setting']['store']['permission_status']) && $_W['setting']['store']['permission_status']['blacklist'] && $menuid == 'store' ||
            is_array($_W['setting']['store']['whitelist']) && !in_array($_W['username'], $_W['setting']['store']['whitelist']) && !empty($_W['setting']['store']['permission_status']) && $_W['setting']['store']['permission_status']['whitelist'] && !($_W['isfounder'] && !user_is_vice_founder()) && $menuid == 'store' ||
            user_is_vice_founder() && in_array($menuid, array('site', 'advertisement', 'appmarket')) ||
            $_W['role'] == ACCOUNT_MANAGE_NAME_CLERK && in_array($menuid, array('account', 'wxapp', 'system')) ||
            !$menu['is_display'] || $_W['setting']['store']['status'] == 1 && $menuid == 'store' && (!$_W['isfounder'] || user_is_vice_founder())) {
            continue;
        }

        // 获取顶层菜单项
        $top_nav[] = array(
            'title' => $menu['title'],
            'name' => $menuid,
            'url' => $menu['url'],
            'blank' => $menu['blank'],
            'icon' => $menu['icon'],
        );
    }


    if (!empty($framename)) { // 返回传入的参数指定顶级菜单内容
        if (($framename == 'system_welcome' || $entry['entry'] == 'system_welcome') && $_W['isfounder']) {
            $frames = $frames['account'];
            $frames['section'] = array('platform_module_welcome' => $frames['section']['platform_module_welcome']);
        } else {
            $frames = $frames[$framename];
        }
    }
    return $frames;

}

/**
 * 系统模块标识
 * @return array
 */
function system_modules()
{
    return array(
        'basic', 'news', 'music', 'service', 'userapi', 'recharge', 'images', 'video', 'voice', 'wxcard',
        'custom', 'chats', 'paycenter', 'keyword', 'special', 'welcome', 'default', 'apply', 'reply', 'core'
    );
}

/**
 * 在当前URL上拼接查询参数，生成url
 *  @param string $params 需要拼接的参数。例如："time:1,group:2"，会在当前URL上加上&time=1&group=2
 * */
function filter_url($params)
{
    global $_W;
    if (empty($params)) {
        return '';
    }
    $query_arr = array();
    $parse = parse_url($_W['siteurl']);
    if (!empty($parse['query'])) {
        $query = $parse['query'];
        parse_str($query, $query_arr);
    }
    $params = explode(',', $params);
    foreach ($params as $val) {
        if (!empty($val)) {
            $data = explode(':', $val);
            $query_arr[$data[0]] = trim($data[1]);
        }
    }
    $query_arr['page'] = 1;
    $query = http_build_query($query_arr);
    return './index.php?' . $query;
}

/**
 *  解析一个链接的查询参数
 * @param $url
 * @return array
 */
function url_params($url)
{
    $result = array();
    if (empty($url)) {
        return $result;
    }
    $components = parse_url($url);
    $params = explode('&', $components['query']);
    foreach ($params as $param) {
        if (!empty($param)) {
            $param_array = explode('=', $param);
            $result[$param_array[0]] = $param_array[1];
        }
    }
    return $result;
}

/**
 * "系统(system)" 菜单中预设的附加角色权限。
 *
 * 可以根据角色来生成菜单，同样可以根据菜单项来获取菜单动作，从而附加该动作到预置权限中
 *
 */
function frames_menu_append()
{
    $system_menu_default_permission = array(
        'founder' => array(),
        'owner' => array(
            'system_account',
            'system_module',
            'system_wxapp',
            'system_module_wxapp',
            'system_my',
            'system_setting_updatecache',
            'system_message_notice',
        ),
        'manager' => array(
            'system_account',
            'system_module',
            'system_wxapp',
            'system_module_wxapp',
            'system_my',
            'system_setting_updatecache',
            'system_message_notice',
        ),
        'operator' => array(
            'system_account',
            'system_wxapp',
            'system_my',
            'system_setting_updatecache',
            'system_message_notice',
        ),
        'clerk' => array(
            'system_my',
        ),
    );
    return $system_menu_default_permission;
}

/**
 * 云注册信息完善提示
 */
function site_profile_perfect_tips()
{
    global $_W;

    if ($_W['isfounder'] && (empty($_W['setting']['site']) || empty($_W['setting']['site']['profile_perfect']))) {
        if (!defined('SITE_PROFILE_PERFECT_TIPS')) {
            $url = url('cloud/profile');
            return <<<EOF
$(function() {
	var html =
		'<div class="we7-body-alert">'+
			'<div class="container">'+
				'<div class="alert alert-info">'+
					'<i class="wi wi-info-sign"></i>'+
					'<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true" class="wi wi-error-sign"></span><span class="sr-only">Close</span></button>'+
					'<a href="{$url}" target="_blank">请尽快完善您在微擎云服务平台的站点注册信息。</a>'+
				'</div>'+
			'</div>'+
		'</div>';
	$('body').prepend(html);
});
EOF;
            define('SITE_PROFILE_PERFECT_TIPS', true);
        }
    }
    return '';
}