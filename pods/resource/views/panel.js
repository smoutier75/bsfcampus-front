define(
    [
        'jquery',
        'underscore',
        'backbone',
        'viewmanager',
        'app/config',

        'view',

        'pods/resource/content/view',
        'pods/resource/views/additionalResourcesList',

        'text!pods/resource/templates/panel.html',

        'app/views/loadingBar',

        'pods/analytics/models/visitedResource',

        'less!pods/resource/style'
    ],
    function ($, _, Backbone, VM, Config,
              AbstractView,
              ResourceContentView, AdditionalResourcesListView,
              panelTemplate,
              LoadingBarView,
              VisitedResourceAnalyticsModel) {

        return AbstractView.extend({

            template: _.template(panelTemplate),

            initialize: function () {
                AbstractView.prototype.initialize.apply(this, arguments);

                var analytics = new VisitedResourceAnalyticsModel();
                analytics.set('resource', this.model.id);
                analytics.save();
            },

            renderMinimum: function () {
                var html = this.template({
                    resource: this.model.toJSON(true),
                    config: Config
                });
                this.$el.html(html);
                this.$resourceContent = this.$('#resource-content');
                this.$additionalResources = this.$('#additional-resources');

                this.renderContent();

                return this;
            },

            renderFetched: function () {
                if (this.model.get('is_additional')) {
                    this.$additionalResources.remove();
                } else {
                    this.renderAdditionalResources();
                }
            },

            renderContent: function () {
                console.log("renderContent");
                var self = this;
                var contentView = VM.createView(Config.constants.VIEWS_ID.RESOURCE_CONTENT, function () {
                    return new ResourceContentView({model: self.model});
                });
                this.$resourceContent.html(contentView.render().$el);
                contentView.activateAfterRendered();
            },

            renderAdditionalResources: function () {
                var additionalResourcesCollection = this.model.get('additional_resources');
                var additionalResourcesListView = new AdditionalResourcesListView({
                    collection: additionalResourcesCollection
                });
                this.$additionalResources.html(additionalResourcesListView.render().$el);

                if (additionalResourcesCollection.length == 0) {
                    this.$additionalResources.hide();
                }
            }

        });

    }
);
