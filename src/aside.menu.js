angular.module('aside.menu', ['menu-tpl.html', 'menu-item-tpl.html', 'ui.router'])
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
                this.toggleSubmenu = function (el, icon, cleanSubmenu) {
                    el.slideToggle();
                    var rightIcon = $('.fa.pull-right', icon);
                    rightIcon.toggleClass('fa-chevron-right fa-chevron-down');
                    this.activeSubmenu = cleanSubmenu ? undefined : el;
                }
            }
        }
    })
    .directive('menuItem', function ($state) {
        return {
            restrict: 'E',
            require: '^asideMenu',
            transclude: true,
            replace: true,
            templateUrl: "menu-item-tpl.html",
            link: function (scope, element, attrs, ctrl) {
                if ($state.params.id === attrs.index) {
                    ctrl.toggleSubmenu($(element.parent().parent()));
                } else if (!$state.params.id && element.hasClass('active') && $(element).get(0).nextElementSibling.tagName === 'UL') {
                    ctrl.toggleSubmenu($($(element).get(0).nextElementSibling));
                }
                scope.$state = $state;
                element.bind('click', function (evt) {
                    var isNotSubItem = !!$(element).next().length,
                        mainItemWithSub = !!$(element).next().not('.ng-hide').length;
                    switch (true) {
                        case isNotSubItem && mainItemWithSub: // is mainItem with submenu
                            var submenu = $(evt.currentTarget.nextElementSibling);
                            if (ctrl.activeSubmenu) {
                                if (angular.equals(ctrl.activeSubmenu, submenu)) {
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
                        case isNotSubItem && !mainItemWithSub: // is mainItem without submenu
                            if (ctrl.activeSubmenu) {
                                ctrl.toggleSubmenu(ctrl.activeSubmenu, ctrl.currentItem, true);
                            }
                            break;
                    }
                });
            }
        }
    });

angular.module("menu-tpl.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("menu-tpl.html",
        "<div class=\"menu-container\">\n    <div class=\"menu-main\">\n        <ul class=\'list-group list-unstyled\'>\n            <li ng-repeat=\"item in items | orderBy:\'index\':false\"\n                class=\"list-group-item menu-item-box {{ \'ind-\' + item.index }} no-select {{ item.id }}\">\n                <menu-item class=\"menu-item\"\n                           link=\"{{item.link}}\"\n                           index=\"{{item.index}}\">\n                    <i class=\"fa {{item.icon}} pull-left\"></i>\n                </menu-item>\n                <ul ng-show=\"item.submenu\"\n                    class=\"submenu list-unstyled\"\n                    style=\"display: none\">\n                    <li ng-repeat=\"item in item.submenu\">\n                        <menu-item class=\"menu-item\"\n                                   link=\"{{item.link}}\"\n                                   index=\"{{item.index}}\"\n                                   score=\"{{item.score}}\">\n                            <i class=\"fa {{item.icon}} pull-left\"></i>\n                        </menu-item>\n                    </li>\n                </ul>\n            </li>\n        </ul>\n    </div>\n</div>");
}]);

angular.module("menu-item-tpl.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("menu-item-tpl.html",
        "<div ui-sref=\"{{item.link}}\" ui-sref-active=\"active\">\n    <span ng-transclude></span>\n\n    <div lass=\"menu-title\" ng-class=\"{\'pull-left\': item.submenu}\">{{ item.name }}</div>\n    <i class=\"fa fa-chevron-right pull-right\" ng-if=\"item.submenu\"></i>\n\n    <div class=\"clearfix\"></div>\n</div>");
}]);
