define(
	[
		'jquery',
		'underscore',
		'backbone',
		'app/config',

		'pods/exercise-attempt/question-answer/models/question-answer',
		'pods/exercise-attempt/question-answer/models/question',

		'text!pods/exercise-attempt/question-answer/unique-answer-mcq/templates/form.html',
		'text!pods/exercise-attempt/question-answer/unique-answer-mcq/templates/form-proposition.html',

		'less!pods/exercise-attempt/question-answer/unique-answer-mcq/style',
	],
	function($, _, Backbone, Config,
		QuestionAnswerModel, QuestionModel,
		formTemplate, formPropositionTemplate
		) {

		return Backbone.View.extend({

			model: QuestionAnswerModel,

			tagName: 'div',

			template: _.template(formTemplate),
			propositionTemplate: _.template(formPropositionTemplate),

			events: {
				'change input[type=radio]': 'changedRadio'
			},

			changedRadio: function() {
			    this.trigger('onAnswerRadioSelected');
			},
			
			render: function() {
				var html = this.template({question: this.model.questionModel().forTemplate(), config: Config});
				this.$el.html(html);
				
				if (this.model.questionModel().get('image_url') != null)
				{
					this.$el.find('.question-image-media').html('<a href="' + this.model.questionModel().get('image_url') + '" target="_blank"><img src="' + this.model.questionModel().get('image_url') + '"></a>');
				}

				var propositions = this.model.questionModel().get('propositions');
				for (var i=0; i < propositions.length; i++)
				{
					proposition = propositions[i];
					var html = this.propositionTemplate({proposition: proposition, index: i});
					var el = this.$el.find('.unique-answer-mcq-propositions');
					el.append(html);
					// if (i < propositions.length - 1)
					// {
					// 	el.append('<hr>');
					// }
				};
			},

		});
		
	}
);
