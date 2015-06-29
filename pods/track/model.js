define(
	[
		'jquery',
		'underscore',
		'backbone',
		'app/config',

		'model'
	],
	function($, _, Backbone, Config, 
		AbstractModel
		) {

		return AbstractModel.extend({

			urlRoot: function() {
				return Config.constants.serverGateway + '/hierarchy/tracks';
			},

			route: function() {
				return '#/track/' + this.id;
			},

            forTemplate: function() {

                var son = AbstractModel.prototype.forTemplate.call(this); // equivalent to super.forTemplate()

                son.iconUrl = son.icon_url;

                return son;
            }

		});

	}
);
