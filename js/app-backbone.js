var app = app || {};

(function() {
	//'use strict';

	// Backbone Models
	app.Choice = Backbone.Model.extend({
		defaults: {
			'text': '',
			'votes': 1
		},
		// Increment number of votes if button is pressed.
		vote: function () {
			this.set('votes',this.get('votes') + 1);
		}
	});

	// Backbone Collections
	var ChoiceList = Backbone.Collection.extend({
		model: app.Choice,
		totalVotes: function () {
			var sum = 0;
			this.each(function (x) {
				sum += x.get('votes');
			});
			return sum;
		},
		search : function(letters){
			if (letters === "") { return this; }

			var pattern = new RegExp(letters,"gi");
			return _(this.filter(function(d) {
				return pattern.test(d.get("text"));
			}));
		}
	});
	// Create instance
	app.Choices = new ChoiceList();

}());


// New function scope to enable jQuery only for views
$(function ($) {

	
	// Backbone Views
	app.AppView = Backbone.View.extend({

		// Top Element of the App
		el: '#votingApp',
		events: {
			'keypress #filter': 'filterByName',
			'keyup #filter': 'filterByName'
		},

		initialize: function () {
			this.listenTo(app.Choices, 'add', this.addChoice);

			app.Choices.fetch();
		},

		filterByName: function(e){
			this.$('#backbone-votes').html('');
			var letters = $(e.currentTarget).val();
			var results = app.Choices.search(letters);
			console.log(results);
			results.each(this.addChoice);
		},

		addChoice: function (c) {
			var vote = new app.ChoiceView({ model: c });
			var result = new app.ResultView({ model: c });
			$('#backbone-votes').append( vote.render().el );
			$('#backbone-results').append( result.render().el );
		}

		
	});

	app.ChoiceView = Backbone.View.extend({
		tagName: 'div',
		className: 'vote-row',
		template: _.template($('#choice-template').html()),
		initialize: function () {
			this.listenTo(this.model, 'change', this.render);
		},

		render: function (model) {
			// Console log
			this.$el.html( this.template( this.model.toJSON() ) );
			return this;
		}
	});

	app.ResultView = Backbone.View.extend({
		tagName: 'div',
		className: 'progress',
		template: _.template($('#result-template').html()),
		initialize: function () {
			this.listenTo(this.model, 'change', this.render);
		},

		render: function (model) {
			// Console log
			this.$el.html( this.template( this.model.toJSON() ) );
			return this;
		}
	});


});

// Backbone App
$(function() {

	// Kick things off by creating the **App**.

	Backbone.sync = function (method, model, options) {
			console.log('SYNCING!');
			/*console.log(method);
			console.log(model);
			console.log(options);
			console.log('SYNCED!');*/
			return true;
	};

	window.appV = new app.AppView();


	app.Choices.create({text: 'jQuery', votes: '3'});
	app.Choices.create({text: 'Underscore', votes: '6'});
	app.Choices.create({text: 'Zepto', votes: '1'});



});