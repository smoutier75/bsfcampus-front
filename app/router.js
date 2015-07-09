define(
    [
        'jquery',
        'underscore',
        'backbone',
        'viewmanager',
        'app/config',

        'pods/user/models/current',
        'pods/track/model',
        'pods/track/collection',
        'pods/skill/model',
        'pods/lesson/model',
        'pods/resource/model',

        'app/header/view',
        'app/footer/view',
        'pods/home/view',
        'pods/user/connection/views/register',
        'pods/user/connection/views/login',
        'pods/user/profile/views/profile',
        'pods/track/views/list',
        'pods/track/views/detail',
        'pods/skill/views/detail',
        'pods/resource/views/detail',
        'pods/breadcrumb/views/breadcrumbContainer',
        'pods/track/views/promptValidation',

        'less!app/styles/common'
    ],
    function ($, _, Backbone, VM, Config,
              currentUser, TrackModel, TrackCollection, SkillModel,
              LessonModel, ResourceModel,
              AppHeaderView, AppFooterView, HomeView, RegisterUserView, LoginUserView, UserProfileView,
              TrackListView, TrackDetailView, SkillDetailView,
              ResourceDetailView, ResourceHierarchyBreadcrumbView, PromptTrackValidationView
              ) {

        var AppRouter = Backbone.Router.extend({

            initialize: function() {
                this.$modal = $('#modal');
                this.$modalDialog = this.$modal.find('.modal-dialog');
            },

            // Global views

            renderHeader: function () {
                this.appHeaderView = new AppHeaderView();
                this.appHeaderView.render();
            },

            renderFooter: function () {
                var appFooterView = new AppFooterView();
                appFooterView.render();
            },

            clearHome: function () {
                $('#home').html('');
            },

            clearContainer: function () {
                var $container = $('#container');
                $container.show();
                $container.html('');
            },

            hideContainer: function () {
                $('#container').hide();
            },

            clearModal: function () {
                this.$modalDialog.empty();
                this.$modal.modal('hide');
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();
            },

            // Routes handling

            routes: {
                '': 'home',
                'register': 'register',
                'login': 'login',
                'login/redirect': 'loginRedirect',
                'logout': 'logout',
                'user/profile': 'userProfile',

                'track': 'trackList',
                'track/:id': 'trackDetail',
                'skill/:id': 'skillDetail',
                'lesson/:id': 'lessonDetail',
                'resource/:id': 'resourceDetail',
                'prompt_track_validation/:track_id': 'promptTrackValidation'
            },

            home: function () {
                if (currentUser.isLoggedIn())
                {
                    this.navigate('user/profile', {trigger: true});
                }
                else
                {
                    this.clearHome();
                    this.clearContainer();
                    this.hideContainer();
                    this.clearModal();

                    var homeView = VM.createView(Config.constants.VIEWS_ID.HOME, function() {
                        return new HomeView();
                    });
                    homeView.render();
                    $('#home').append(homeView.$el);

                    this.appHeaderView.updateHeaderButtonFocus('home');
                }
            },

            register: function () {
                this.clearModal();
                var registerUserView = new RegisterUserView({
                    el: this.$modalDialog
                });
                registerUserView.render();
                var self = this;
                this.listenTo(registerUserView, 'close', function() {
                    self.returnFromAuthenticationPopup(registerUserView);
                });
                this.$modal.on('shown.bs.modal', function() {
                    registerUserView.$('form input#full_name').focus();
                }).modal({show: true});
            },

            login: function () {
                this.clearModal();
                var loginUserView = new LoginUserView({
                    el: this.$modalDialog
                });
                loginUserView.render();
                var self = this;
                this.listenTo(loginUserView, 'close', function() {
                    self.returnFromAuthenticationPopup(loginUserView);
                });
                this.$modal.on('shown.bs.modal', function() {
                    loginUserView.$('form input#username').focus();
                }).modal('show');
            },

            loginRedirect: function () {
                var self = this;
                var next = Backbone.history.getFragment();
                var loginUserView = new LoginUserView({
                    el: this.$modalDialog
                });
                loginUserView.render();
                this.listenTo(loginUserView, 'close', function () {
                    self.clearModal();
                    Backbone.history.loadUrl(next);
                });
                this.$modal.on('shown.bs.modal', function() {
                    loginUserView.$('form input#username').focus();
                }).modal('show');
            },

            returnFromAuthenticationPopup: function (authView) {
                console.log("returnFromAuthenticationPopup");
                this.clearModal();
                authView.undelegateEvents();
                var fragment = Backbone.history.getFragment();
                this.navigate(fragment, {trigger:true, replace:true});
            },

            logout: function () {
                currentUser.logOut();
                Backbone.history.navigate('', {trigger: true});
            },

            userProfile: function () {
                var self = this;
                currentUser.fetch().done(function () {
                    self.clearHome();
                    self.clearContainer();
                    self.clearModal();

                    var userProfileView = new UserProfileView({model: currentUser});
                    userProfileView.render();
                    $('#container').append(userProfileView.$el);

                    self.appHeaderView.updateHeaderButtonFocus('user');
                });
            },

            trackList: function () {
                var collection = new TrackCollection();
                var self = this;
                collection.fetch().done(function () {
                    self.clearHome();
                    self.clearContainer();
                    self.clearModal();

                    var trackListView = new TrackListView({collection: collection});
                    trackListView.render();
                    $('#container').append(trackListView.$el);
                });

                this.appHeaderView.updateHeaderButtonFocus('hierarchy');
            },

            trackDetail: function (id) {
                var model = new TrackModel({_id: id});
                var self = this;
                model.fetch().done(function () {
                    self.clearHome();
                    self.clearContainer();
                    self.clearModal();

                    var trackDetailView = new TrackDetailView({model: model});
                    trackDetailView.render();
                    $('#container').append(trackDetailView.$el);
                });
            },

            skillDetail: function (id) {
                var model = new SkillModel({_id: id});
                var self = this;
                model.fetch().done(function () {
                    self.clearHome();
                    self.clearContainer();
                    self.clearModal();
                    self.renderResourceHierarchyBreadcrumb(model.get('breadcrumb'));

                    var skillDetailView = new SkillDetailView({model: model});
                    skillDetailView.render();
                    $('#container').append(skillDetailView.$el);
                });
            },

            lessonDetail: function (id) {
                var model = new LessonModel({_id: id});
                var self = this;
                model.fetch().done(function () {
                    self.clearHome();
                    self.clearContainer();
                    self.clearModal();
                    self.renderResourceHierarchyBreadcrumb(model.get('breadcrumb'));

                    var skillId = model.get('skill')._id;
                    Backbone.history.navigate('skill/' + skillId, {trigger: true});
                });
            },

            resourceDetail: function (id) {
                var model = new ResourceModel({_id: id});
                var self = this;
                model.fetch().done(function () {
                    self.clearHome();
                    self.clearContainer();
                    self.clearModal();
                    self.renderResourceHierarchyBreadcrumb(model.get('breadcrumb'));

                    var resourceDetailView = new ResourceDetailView({model: model});
                    resourceDetailView.render();
                    $('#container').append(resourceDetailView.$el);
                });
            },

            renderResourceHierarchyBreadcrumb: function (breadcrumbModel) {
                var breadcrumbView = new ResourceHierarchyBreadcrumbView({model: breadcrumbModel});
                breadcrumbView.render();
                $('#container').append(breadcrumbView.$el);
            },

            promptTrackValidation: function (track_id) {
                this.clearModal();
                var promptTrackValidationView = new PromptTrackValidationView({
                    el: this.$modalDialog
                });
                promptTrackValidationView.trackId = track_id;
                promptTrackValidationView.render();
                this.listenTo(promptTrackValidationView, 'close', this.clearModal);
                this.$modal.modal('show');
            }

        });

        return {
            initialize: function () {

                currentUser.findSession();

                $(document).ajaxSend(function(event, jqxhr, settings) {
                    if (currentUser.jwt !== null) {
                        jqxhr.setRequestHeader('Authorization', 'Bearer ' + currentUser.jwt);
                    }
                });

                // Tell jQuery to watch for any 401 or 403 errors and handle them appropriately
                $.ajaxSetup({
                    statusCode: {
                        401: function () {
                            // Redirect the to the login page.
                            console.log("error 401 detected");
                            console.log(Backbone.history.getFragment());
                            if (Backbone.history.getFragment() != '')
                            {
                                Backbone.history.loadUrl("/login/redirect");
                            }
                        }
                    }
                });

                if (currentUser.isLoggedIn()) {
                    currentUser.fetch().fail(
                        function() {
                            currentUser.logOut();
                        }
                    );
                }


                var app_router = new AppRouter();
                app_router.renderHeader();
                app_router.renderFooter();
                Backbone.history.start();
            }
        };

    }
);
