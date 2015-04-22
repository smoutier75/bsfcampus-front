define(
	[
		'jquery',
		'underscore',
		'backbone',
		'app/config',

		'pods/exercise-attempt/question-answer/models/question-answer',
		'pods/exercise-attempt/question-answer/models/question',

		'text!pods/exercise-attempt/question-answer/dropdowns/templates/feedback.html',
		'text!pods/exercise-attempt/question-answer/dropdowns/templates/feedback-dropdown.html',
	],
	function($, _, Backbone, Config,
		QuestionAnswerModel, QuestionModel,
		feedbackTemplate, feedbackDropdownTemplate
		) {

		return Backbone.View.extend({

			model: QuestionAnswerModel,

			tagName: 'div',

			template: _.template(feedbackTemplate),
			dropdownTemplate: _.template(feedbackDropdownTemplate),
			
			render: function() {
				console.log("dropdowns render", this.model.forTemplate());
				var html = this.template({question: this.model.forTemplate().question, config: Config});
				this.$el.html(html);
				
				if (this.model.questionModel().get('image_url') != null)
				{
					this.$el.find('.question-image-media').html('<img src="' + this.model.questionModel().get('image_url') + '">');
				}

				var text = this.model.questionModel().get('text');
				var splittedText = text.split("[%%]");

				var dropdowns = this.model.questionModel().get('dropdowns');
				dropdownHtmlText = '';
				for (var i=0; i < splittedText.length; i++)
				{
					this.$el.find('.dropdowns-feedback').append(splittedText[i]);
					if (i < splittedText.length-1)
					{
						// We add the dropdown here
						dropdown = dropdowns[i];
						correct_answer = _.find(dropdown.propositions, function (proposition) {
							return proposition.is_correct_answer;
						})
						console.log(correct_answer);
						var html = this.dropdownTemplate({correct_answer: correct_answer});
						this.$el.find('.dropdowns-feedback').append(html);
						if (_.contains(this.model.get('given_answer').given_propositions, correct_answer._id))
						{
							this.$el.find('.dropdowns-feedback .dropdown').addClass('right-answer');
						}
						else
						{
							this.$el.find('.dropdowns-feedback .dropdown').addClass('wrong-answer');
						}
					}
				};

				var answerExplanationEl = this.$el.find('.answer-explanation');
				if (this.model.get('is_answered_correctly') === true)
				{
					answerExplanationEl.addClass('right-answer');
				}
				else
				{
					answerExplanationEl.addClass('wrong-answer');
				}
				if (this.model.get('question').answer_feedback != null)
				{
					answerExplanationEl.html(this.model.get('question').answer_feedback);
					answerExplanationEl.show();
				}
				else
				{
					answerExplanationEl.html('');
				}

				return this;
			},

			renderProposition: function(proposition, index) {
				var html = this.propositionTemplate({proposition: proposition, index: index, config:Config});
				var $proposition = $(html);
				$proposition.addClass('disabled');
				if (_.contains(this.model.get('given_answer').given_propositions, proposition._id)) {
					$proposition.addClass('proposition_selected');
				}
				if (proposition.is_correct_answer) {
					$proposition.addClass('proposition_correct');
				}
				this.$el.find('.dropdowns-propositions').append($proposition);
			},

		});
		
	}
);
