myApp.value('TranType', {
  ORDER_TO_SUPPLIER:      'ORDER_TO_SUPPLIER',
  RECEIVE_FROM_SUPPLIER:  'RECEIVE_FROM_SUPPLIER',
  ORDER_FROM_HOSPITAL:    'ORDER_FROM_HOSPITAL',
  DELIVER_TO_HOSTPITAL:   'DELIVER_TO_HOSTPITAL',
  INITIALIZE:             'INITIALIZE',
  getTranStatus: function(type) {
    switch(type) {
      case this.ORDER_TO_SUPPLIER:
        return 'RECEIVE';
      case this.ORDER_FROM_HOSPITAL:
        return 'DELIVER';
      default:
        return '';
    }
  }
});

myApp.value('TranStatus', {
  RECEIVE: 'RECEIVE',
  DELIVER: 'DELIVER',
  DONE:    'DONE',
  NA:      '',
  showButton: function(status) {
    switch(status) {
      case this.RECEIVE:
        return true;
      case this.DELIVER:
        return true;
      default:
        return false;
    }
  }
});

myApp.value('BeadType', {
  PROCESS:      'Process',
  SPECIAL:      'Special',
  ALPHABET:     'Alphabet',
  NUMBER:       'Number',
  DISCONTINUED: 'Discontinued',
  getSortOrder: function(type) {
    switch(type) {
      case this.PROCESS:
        return 1;
      case this.SPECIAL:
        return 2;
      case this.ALPHABET:
        return 7;
      case this.NUMBER:
        return 8;
      case this.DISCONTINUED:
        return 9;
      default:
        return 5;
    }
  }
});
