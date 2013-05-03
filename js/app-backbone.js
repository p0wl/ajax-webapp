var app = app || {};

(function() {
	'use strict';

	// Backbone Model
	app.Choice = Backbone.Model.extend({
		defaults: {
			'text': '',
			'votes': 1
		},
		// Anzahl der Stimmen erhöhen.
		vote: function () {
			this.set('votes',Number(this.get('votes')) + 1);
		},
		// Berechnung des Balkens
		barValue: function () {
			return (Number(this.get('votes')) / Number(app.Choices.totalVotes()) *100);
		},
		forTemplate: function() {
			var j = this.toJSON();
			j.barValue = this.barValue();
			return j;
		}
	});

	// Backbone Collection
	var ChoiceList = Backbone.Collection.extend({
		// Model für diese Collection festlegen
		model: app.Choice,
		url: "localhost",
		// Gesamtanzahl der Stimmen berechnen
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

		// Filterfunktionalität
		search: function(letters){
			if (letters === "") { return this; }

			return _(this.filter(function(d) {
				var pattern = new RegExp(letters,"gi");
				return pattern.test(d.get("text"));
			}));
		}
	});
	// Instanz erstellen
	app.Choices = new ChoiceList();

}());

// Initialisierung
$(function ($) {

	// Backbone Views
	app.AppView = Backbone.View.extend({

		// View
		el: '#votingApp',

		// Definition der Events
		events: {
			// Use Case 3 - Filtern
			'keypress #filter': 'filterByName',
			'keyup #filter': 'filterByName',

			// Use Case 2 - Option hinzufügen
			'click #btnToggle': 'btnToggle',
			'keypress #txtAdd': 'submitOnEnter',
			'click #btnAdd': 'btnAdd'
		},

		// Event Binding
		initialize: function () {
			// Use Case 2 - Option hinzufügen: Filter zurücksetzen
			this.listenTo(app.Choices, 'add', this.resetFilter);
			// Use Case 3 - Filtern: Bei jeglichem Event Filter anwenden
			this.listenTo(app.Choices, 'all', this.filterByName);
		},

		// Use Case 2 - Option hinzufügen: Button
		btnToggle: function () {
			$('#btnToggle').hide();
			$('#divToggle').show();
		},

		// Usability: Enter anstatt klick auf den Hinzufügen Knopf zulassen.
		submitOnEnter: function (e) {
			if ( e.which !== 13) {
				return;
			}
			else
			{
				this.btnAdd();
			}
		},

		// Use Case 2 - Option hinzufügen
		btnAdd: function () {
			var val = $('#txtAdd').val().trim();
			if (val !== "") {
				// Neues Model erstellen
				app.Choices.create({text: val});
				// Darstellung anpassen
				$('#btnToggle').show();
				$('#divToggle').hide();
				$('#txtAdd').val('');
			}
		},

		// Use Case 3 - Filtern
		filterByName: function(e){
			// Zurücksetzen der Darstellung
			this.$('#backbone-votes').html('');
			this.$('#backbone-results').html('');


			var letters = $(e.currentTarget || '#filter').val();
			//var col = app.Choices.sort({silent: true});
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