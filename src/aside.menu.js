/**
 * Created by Robert Gurgul on 2015-03-15.
 */

angular.module('aside.menu', ['menu-tpl.html', 'menu-item-tpl.html', 'ui.router'])
    .directive('asideMenu', function ($http) {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: "menu-tpl.html",
            controller: function ($scope, $element, $attrs) {
                $http.get($attrs.items)
                    .success(function (responseData) {
                        $scope.items = responseData.data;
                    });
                this.toggleSubmenu = function (el, icon, cleanSubmenu) {
                    el.slideToggle();
                    var rightIcon = $('.fa.pull-right', icon);
                    rightIcon.toggleClass('fa-chevron-right fa-chevron-down');
                    this.activeSubmenu = cleanSubmenu ? undefined : el;
                }
            }
        }
    })
    .directive('menuItem', function ($state, $timeout) {
        return {
            restrict: 'E',
            require: '^asideMenu',
            transclude: true,
            replace: true,
            templateUrl: "menu-item-tpl.html",
            link: function (scope, element, attrs, ctrl) {
                $timeout(function () {
                    if ($state.params.id === attrs.index && $state.includes(attrs.link)) {
                        var ul = $(element).closest('ul');
                        ctrl.toggleSubmenu(ul, ul.prev());
                        element.addClass('active');
                        ctrl.currentItem = ul.prev();
                    } else if (!$state.params.id && $state.current.name === attrs.link) {
                        element.addClass('active');
                    }
                })

                scope.$state = $state;
                element.bind('click', function (evt) {
                    if (attrs.link) {
                        $state.go(attrs.link, {'id': attrs.index});
                        $('.active', '.menu-main').removeClass('active');
                        element.addClass('active');
                    }
                    var submenu = $(element).next(),
                        subItem = element.hasClass('sub-item');
                    switch (true) {
                        case !!submenu.length: // is mainItem with submenu
                            if (ctrl.activeSubmenu) {
                                if (submenu.is(ctrl.activeSubmenu)) {
                                    ctrl.toggleSubmenu(ctrl.activeSubmenu, evt.currentTarget, true);
                                } else {
                                    ctrl.toggleSubmenu(ctrl.activeSubmenu, ctrl.currentItem);
                                    ctrl.toggleSubmenu(submenu, evt.currentTarget);
                                }
                            } else {
                                ctrl.toggleSubmenu(submenu, evt.currentTarget);
                            }
                            ctrl.currentItem = evt.currentTarget;
                            break;
                        case !subItem && !submenu.length: // is mainItem without submenu
                            if (ctrl.activeSubmenu) {
                                ctrl.toggleSubmenu(ctrl.activeSubmenu, ctrl.currentItem, true);
                            }
                            break;
                    }
                });
            }
        }
    });

angular.module("menu-tpl.html", []).run(function ($templateCache) {
    $templateCache.put("menu-tpl.html",
        "<div class=\"menu-main\">\n    <ul class=\'list-group list-unstyled\'>\n        <li ng-repeat=\"item in items\" class=\"list-group-item menu-item-box no-select\">\n            <menu-item class=\"menu-item\" link=\"{{item.link}}\" index=\"{{item.index}}\">\n                <i class=\"fa {{item.icon}} pull-left\"></i>\n            </menu-item>\n            <ul ng-if=\"item.submenu\" class=\"submenu list-unstyled\" style=\"display: none\">\n                <li ng-repeat=\"item in item.submenu\">\n                    <menu-item class=\"menu-item sub-item\" link=\"{{item.link}}\" index=\"{{item.index}}\" score=\"{{item.score}}\">\n                        <i class=\"fa {{item.icon}} pull-left\"></i>\n                    </menu-item>\n                </li>\n            </ul>\n        </li>\n    </ul>\n</div>");
});

angular.module("menu-item-tpl.html", []).run(function ($templateCache) {
    $templateCache.put("menu-item-tpl.html",
        "<div>\n    <span ng-transclude></span>\n    <div class=\"menu-title\" ng-class=\"{\'pull-left\': item.submenu}\">{{ item.name }}</div>\n    <i class=\"fa fa-chevron-right pull-right\" ng-if=\"item.submenu\"></i>\n    <div class=\"clearfix\"></div>\n</div>");
});
