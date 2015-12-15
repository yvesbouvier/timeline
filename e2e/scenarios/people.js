'use strict';

var ItemList    = require('../pages/ItemList.js');
var ItemDetails = require('../pages/ItemDetails.js');
var Item = require('../pages/Item.js');

describe('my app', function() {

  var people   = new ItemList();
  var details = new ItemDetails();
  var item = new Item();

  beforeEach(function() {
    people.loadAll();
  });

  it('should load a list of users', function() {
    expect(people.count()).toBeGreaterThan(1);
  });

  describe('selecting a item', function() {

    beforeEach(function() {
      return details.contactUser();
    });

    it('should set focus on first button in the bottomsheet view', function() {
      expect( item.buttons().count() ).toBe(4);
      expect( item.buttons().first().getText() ).toEqual( 'PHONE' );
      expect( item.focusedButton().getText() ).toEqual( 'PHONE' );
    });

  });
});
