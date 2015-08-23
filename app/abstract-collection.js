define(
    [
        'jquery',
        'underscore',
        'backbone',
        'app/config'
    ],
    function ($, _, Backbone, Config) {

        return Backbone.Collection.extend({

            minimumFilled: false,
            fetched: false,
            fetching: false,

            markFetched: function (when, options) {
                this.fetching = false;
                when || (when = _.now());
                options || (options = {});
                this.fetched = when;
                if (!options.dontPropagate) {
                    this.each(function (model) {
                        model.markFetched(when, options);
                    });
                }
                if (!options.silent) {
                    this.trigger('fetch');
                }
            },

            fetch: function (options) {
                if (this.fetching) {
                    var self = this;
                    var dfd = $.Deferred();
                    this.listenTo(this, 'fetch', function () {
                        dfd.resolve().promise(self);
                    });
                    return dfd;
                }
                this.fetching = true;
                options || (options = {});
                var success = options.success;
                options.success = function (model, response, xhrOptions) {
                    model.markFetched(null, xhrOptions);
                    if (success) success.call(this, model, response, xhrOptions);
                };
                options || (options = {});
                return Backbone.Collection.prototype.fetch.call(this, options);
            },

            fetchIfNeeded: function (options) {
                if (this.fetched) {
                    return $.Deferred().resolve().promise(this);
                } else {
                    return this.fetch(options);
                }
            },

            getAsync: function (id) {
                var savedModel = Backbone.Collection.prototype.get.apply(this, arguments);
                if (savedModel == null) {
                    var attr;
                    if (typeof id === "String") {
                        attr = {};
                        attr[this.model.idAttribute] = id;
                    } else {
                        attr = id;
                    }
                    var model = new this.model(attr);
                    this.add(model);
                    return model.fetch();
                } else {
                    var dfd = $.Deferred();
                    return dfd.promise(savedModel).resolve();
                }
            },

            getOrInstantiate: function (obj) {
                var savedModel = Backbone.Collection.prototype.get.apply(this, arguments);
                if (savedModel) {
                    return savedModel;
                }
                var attr;
                if (typeof obj === "string") {
                    (attr = {})[this.model.prototype.idAttribute] = obj;
                } else {
                    attr = this._isModel(obj) ? obj.attributes : obj;
                }
                var model = new this.model(attr);
                this.add(model);
                return model;
            },

            parse: function (response, options) {
                options || (options = {});

                var jsonKey = options.jsonKey || this.jsonKey || 'data';
                response = response[jsonKey];

                response = this.recursiveNormalize(response);

                return response;
            },

            recursiveNormalize: function (obj) {

                // Normalize the payload to convert BSON to JSON.
                // Go through the entire object recursively,
                // and transform special types (ObjectId, Date) to strings.

                if (obj === null) {
                    return null;
                }

                if (obj.constructor === Array) {
                    // If this is an array, normalize each element

                    return _.map(obj, function (value) {
                        return this.recursiveNormalize(value);
                    }, this);


                } else if (obj.constructor === Object) {
                    // If this is an object, normalize each element

                    var keys = Object.keys(obj);

                    // Detect ObjectIds and Dates, then extract the relevant value.
                    if (keys.length === 1) {
                        if (keys[0] === "$oid") {
                            return obj[keys[0]];
                        } else if (keys[0] === "$date") {
                            return obj[keys[0]];
                        }
                    }

                    // If this was not a special type, proceed with all keys.
                    return _.object(
                        _.map(obj, function (value, key) {
                            return [key, this.recursiveNormalize(value)];
                        }, this)
                    );

                } else {

                    return obj;

                }
            },

            serverPath: '',

            url: function () {
                return Config.constants.serverGateway + _.result(this, 'serverPath', '');
            }

        });

    }
);