define(
    [
        'jquery',
        'underscore',
        'backbone',
        'form2js',
        'jqueryui',
        'app/config',

        'pods/exercise-attempt/question-answer/models/question-answer',
        'pods/exercise-attempt/question-answer/models/question',

        'text!pods/exercise-attempt/question-answer/ordering/templates/form.html',
        'text!pods/exercise-attempt/question-answer/ordering/templates/form-ordering.html',

        'less!pods/exercise-attempt/question-answer/ordering/style.less'
    ],
    function ($, _, Backbone, form2js, JQueryUI, Config,
              QuestionAnswerModel, QuestionModel,
              formTemplate, formOrderingTemplate) {

        return Backbone.View.extend({

            model: QuestionAnswerModel,

            tagName: 'div',

            id: 'ordering',

            template: _.template(formTemplate),
            orderingTemplate: _.template(formOrderingTemplate),

            render: function () {
                var html = this.template({question: this.model.questionModel().forTemplate(), config: Config});
                this.$el.html(html);

                if (this.model.questionModel().get('image_url') != null) {
                    this.$el.find('.question-image-media').html('<a href="' + this.model.questionModel().get('image_url') + '" target="_blank"><img src="' + this.model.questionModel().get('image_url') + '"></a>');
                }
                else
                {
                    this.$el.find('.question-image-media').hide();
                }

                _.each(this.model.questionModel().get('items'), this.renderItem, this);

                self = this;
                this.$el.find("#ordering-items-target, #ordering-items-source").sortable({
                    connectWith: ".connectedSortable",
                    placeholder: "item-draggable-placeholder",
                    receive: function (event, ui) {
                        self.trigger('onOrderingSortableItemReceived');
                    }
                }).disableSelection();

                return this;
            },

            renderItem: function (item) {
                var html = this.orderingTemplate({item: item});
                this.$el.find("#ordering-items-source").append(html);
            },

            serializeForm: function () {
                return {form_data: JSON.stringify(form2js('question-form', '.'))};
            }

        })

    }
)
