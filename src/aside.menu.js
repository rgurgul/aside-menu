angular.module('aside.menu', ['menu-tpl.html', 'menu-item-tpl.html'])
    .directive('asideMenu', function ($http, $location) {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: "menu-tpl.html",
            controller: function ($scope, $element, $attrs) {
                $http.get($attrs.items)
                    .success(function (responseData) {
                        $scope.items = responseData.data;
                    });
                this.goToUrl = function (link) {
                    $location.path(link);
                    $scope.$apply();
                };
                this.changeState = function (el, icon) {
                    el.slideToggle();
                    var rightIcon = $('.fa.pull-right', icon);
                    rightIcon.toggleClass('fa-chevron-right fa-chevron-down');
                };
                this.setActive = function (el, isSubItem) {
                    if (isSubItem) {
                        var li = $('li', $(el).closest('.submenu'));
                        li.removeClass('active');
                    } else if (this.currentActive) {
                        var menuActive = $('.menu-main .active');
                        menuActive.removeClass('active');
                    }
                    this.currentActive = el;
                    el.addClass('active');
                }
            }
        }
    })
    .directive('menuItem', function () {
        return {
            restrict: 'E',
            require: '^asideMenu',
            transclude: true,
            replace: true,
            templateUrl: "menu-item-tpl.html",
            link: function (scope, element, attrs, ctrl) {
                element.bind('click', function (evt) {
                    var parent = element.parent(),
                        isNotSubItem = !!$(element).next().length,
                        mainItemWithSub = !!$(element).next().not('.ng-hide').length;
                    ctrl.setActive(parent, !isNotSubItem);
                    switch (true) {
                        case !isNotSubItem: // is submenu item;
                            ctrl.goToUrl(attrs.link);
                            break;
                        case isNotSubItem && mainItemWithSub: // is mainItem with submenu
                            var submenu = $(evt.currentTarget.nextElementSibling);
                            if (ctrl.activeSubmenu) {
                                if (angular.equals(ctrl.activeSubmenu, submenu)) {
                                    ctrl.changeState(ctrl.activeSubmenu, evt.currentTarget);
                                    ctrl.activeSubmenu = undefined;
                                } else {
                                    ctrl.changeState(ctrl.activeSubmenu, ctrl.currentItem);
                                    ctrl.changeState(submenu, evt.currentTarget);
                                    ctrl.activeSubmenu = submenu;
                                }
                            } else {
                                ctrl.changeState(submenu, evt.currentTarget);
                                ctrl.activeSubmenu = submenu;
                            }
                            ctrl.currentItem = evt.currentTarget;
                            break;
                        case isNotSubItem && !mainItemWithSub: // is mainItem without submenu
                            if (ctrl.activeSubmenu) {
                                ctrl.changeState(ctrl.activeSubmenu, ctrl.currentItem);
                                ctrl.activeSubmenu = undefined;
                            }
                            ctrl.goToUrl(attrs.link);
                            break;
                        default:
                            ctrl.goToUrl(attrs.link);
                            break;
                    }
                });
            }
        }
    });

angular.module("menu-tpl.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("menu-tpl.html",
        "<div class=\"menu-container\">\n    <div class=\"menu-main\">\n        <ul class=\'list-group list-unstyled\'>\n            <li ng-repeat=\"item in items | orderBy:\'index\':false\"\n                class=\"list-group-item menu-item-box {{ \'ind-\' + item.index }} no-select {{ item.id }}\">\n                <menu-item ng-class=\"{active: item.link == currentRoute}\"\n                           class=\"menu-item\"\n                           link=\"{{item.link}}\"\n                           index=\"{{item.index}}\">\n                    <i class=\"fa fa-lg {{item.icon}} pull-left\"></i>\n                </menu-item>\n                <ul ng-show=\"item.submenu\"\n                    class=\"submenu list-unstyled\"\n                    style=\"display: none\">\n                    <li ng-repeat=\"item in item.submenu\">\n                        <menu-item class=\"menu-item\"\n                                   link=\"{{item.link}}\"\n                                   index=\"{{item.index}}\"\n                                   score=\"{{item.score}}\">\n                            <i class=\"fa {{item.icon}} pull-left\"></i>\n                        </menu-item>\n                    </li>\n                </ul>\n            </li>\n        </ul>\n    </div>\n</div>");
}]);

angular.module("menu-item-tpl.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("menu-item-tpl.html",
        "<div class=\'\'>\n    <span ng-transclude></span>\n\n    <div class=\"menu-title\" ng-class=\'{\"pull-left\": item.submenu}\'>{{ item.name }}</div>\n    <i class=\"fa fa-lg fa-chevron-right pull-right\" ng-if=\"item.submenu\"></i>\n\n    <div class=\'clearfix\'></div>\n</div>");
}]);
