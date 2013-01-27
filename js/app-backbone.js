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
			this.set('votes',Number(this.get('votes')) + 1);
		},
		// Calculate bar value
		barValue: function () {
			return (Number(this.get('votes')) / Number(app.Choices.totalVotes()) *100);
		},
		forTemplate: function() {
			var j = this.toJSON();
			j.barValue = this.barValue();
			return j;
		}
	});

	// Backbone Collections
	var ChoiceList = Backbone.Collection.extend({
		model: app.Choice,
		totalVotes: function () {
			var sum = 0;
			this.each(function (x) {
				sum += Number(x.get('votes'));
			});
			return sum;
		},

		comparator: function (m) {
			return m.get('text').toLowerCase();
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
			'keyup #filter': 'filterByName',
			'click #btnToggle': 'btnToggle',
			'keypress #txtAdd': 'submitOnEnter'
		},

		initialize: function () {
			this.listenTo(app.Choices, 'add', this.resetFilter);
			this.listenTo(app.Choices, 'all', this.filterByName);
		},

		btnToggle: function () {
			$('#btnToggle').hide();
			$('#divToggle').show();
		},

		submitOnEnter: function (e) {
			if ( e.which !== 13) {
				return;
			}
			else
			{
				this.btnAdd();
			}
		},

		btnAdd: function () {
			var val = $('#txtAdd').val().trim();
			if (val !== "") {
				app.Choices.create({text: val});
				$('#btnToggle').show();
				$('#divToggle').hide();
				$('#txtAdd').val('');
			}
		},

		filterByName: function(e){
			this.$('#backbone-votes').html('');
			this.$('#backbone-results').html('');

			var letters = $(e.currentTarget || '#filter').val();
			var col = app.Choices.sort({silent: true});
			var results = app.Choices.search(letters);
			results.each(this.renderChoice);
			results.each(this.renderResult);
		},

		resetFilter: function (c) {
			$('#filter').val('');
		},

		renderChoice: function (c) {
			var vote = new app.ChoiceView({ model: c });
			$('#backbone-votes').append( vote.render().el );
		},

		renderResult: function (c) {
			var result = new app.ResultView({ model: c });
			$('#backbone-results').append( result.render().el );
		},

		renderResults: function ()
		{
			this.$('#backbone-results').html('');
			app.Choices.each(this.renderResult);
		}

		
	});

	app.ChoiceView = Backbone.View.extend({
		tagName: 'div',
		className: 'vote-row',
		template: _.template($('#choice-template').html()),
		events: {
			'click button.btn': 'addVote'
		},
		initialize: function () {
			this.listenTo(this.model, 'change', this.render);
		},

		render: function (model) {
			this.$el.html( this.template( this.model.toJSON() ) );
			return this;
		},

		addVote: function () {
			// Increase vote count
			this.model.vote();
		}
	});

	app.ResultView = Backbone.View.extend({
		tagName: 'div',
		className: 'progress',
		template: _.template($('#result-template').html()),
		initialize: function () {
		},

		render: function (model) {
			this.$el.html( this.template( this.model.forTemplate() ) );
			return this;
		}
	});


});

// Backbone App
$(function() {

	// Overwrite to avoid syncing, as long as debuging
	Backbone.sync = function (method, model, options) {
			return true;
	};

	new app.AppView();

	// Initial data for debuging.
	app.Choices.create({text: 'jQuery', votes: '3'});
	app.Choices.create({text: 'Underscore', votes: '6'});
	app.Choices.create({text: 'Zepto', votes: '1'});



});