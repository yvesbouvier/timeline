'use strict';

var PersonList    = require('../pages/PersonList.js');
var PersonDetails = require('../pages/PersonDetails.js');
var Person = require('../pages/Person.js');

describe('my app', function() {

  var people   = new PersonList();
  var details = new PersonDetails();
  var person = new Person();

  beforeEach(function() {
    people.loadAll();
  });

  it('should load a list of users', function() {
    expect(people.count()).toBeGreaterThan(1);
  });

  describe('selecting a person', function() {

    beforeEach(function() {
      return details.contactUser();
    });

    it('should set focus on first button in the bottomsheet view', function() {
      expect( person.buttons().count() ).toBe(4);
      expect( person.buttons().first().getText() ).toEqual( 'PHONE' );
      expect( person.focusedButton().getText() ).toEqual( 'PHONE' );
    });

  });
});
