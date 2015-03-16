define(
	[
		'jquery',
		'underscore',
		'backbone',

		'pods/track/model',
		
		'text!pods/track/templates/list-item.html'
	],
	function($, _, Backbone,
		TrackModel,
		listItemTemplate
		) {

		return Backbone.View.extend({

			model: TrackModel,

			tagName: 'div',

			template: _.template(listItemTemplate),

			render: function() {
				var html = this.template({track: this.model.forTemplate()});
				this.$el.html(html);
				console.log("this.$el.find('.hierarchy-text a')", this.$el.find(".hierarchy-text a"));
				this.$el.find(".hierarchy-text a").addClass("start");
				
				return this;
			},

		});
		
	}
);
