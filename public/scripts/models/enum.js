myApp.value('TranType', {
  ORDER_TO_SUPPLIER:      'ORDER_TO_SUPPLIER',
  RECEIVE_FROM_SUPPLIER:  'RECEIVE_FROM_SUPPLIER',
  ORDER_FROM_HOSPITAL:    'ORDER_FROM_HOSPITAL',
  DELIVER_TO_HOSPITAL:    'DELIVER_TO_HOSPITAL',
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
  },
  getTypeInWeb: function(type) {
    switch(type) {
      case this.ORDER_TO_SUPPLIER:
        return 'Order ->';
      case this.RECEIVE_FROM_SUPPLIER:
        return 'Receive <-';
      case this.ORDER_FROM_HOSPITAL:
        return 'Order <-';
      case this.DELIVER_TO_HOSPITAL:
        return 'Deliver ->';
      case this.INITIALIZE:
        return 'Init';
      default:
        return 'Others';
    }
  },
  getHospitalInWeb: function(type) {
    switch(type) {
      case this.ORDER_TO_SUPPLIER:
        return {'id':0, 'name':'BOC'};
      case this.RECEIVE_FROM_SUPPLIER:
        return {'id':0, 'name':'BOC'};
      default:
        return '';
    }
  }
});

myApp.value('TranStatus', {
  RECEIVE: 'RECEIVE',
  DELIVER: 'DELIVER',
  DONE:    'DONE',
  CANCEL:  'CANCEL',
  NA:      '',
  getStatusInHospitalScreen: function(type) {
    switch(type) {
      case this.DELIVER:
        return '発送準備中';
      case this.DONE:
        return '発送済';
      case this.CANCEL:
        return '取消';
      default:
        return '';
    }
  }
});

myApp.value('BeadType', {
  PROCESS:      'Process',
  SPECIAL:      'Special',
  OTHER:        'Other',
  ALPHABET:     'Alphabet',
  NUMBER:       'Number',
  DISCONTINUED: 'Discontinued',
  getSortOrder: function(type) {
    switch(type) {
      case this.PROCESS:
        return 1;
      case this.SPECIAL:
        return 2;
      case this.OTHER:
        return 3;
      case this.ALPHABET:
        return 7;
      case this.NUMBER:
        return 8;
      case this.DISCONTINUED:
        return 9;
      default:
        return 5;
    }
  },
  getTypeInJapanese: function(type) {
    switch(type) {
      case this.PROCESS:
        return 'プロセス';
      case this.SPECIAL:
        return 'スペシャル';
      case this.OTHER:
        return 'その他';
      case this.ALPHABET:
        return 'アルファベット';
      case this.NUMBER:
        return '数字';
      case this.DISCONTINUED:
        return '廃止';
      default:
        return type;
    }
  },
  getTypeInEnglish: function(type) {
    switch(type) {
      case 'プロセス':
        return this.PROCESS;
      case 'スペシャル':
        return this.SPECIAL;
      case 'その他':
        return this.OTHER;
      case 'アルファベット':
        return this.ALPHABET;
      case '数字':
        return this.NUMBER;
      case '廃止':
        return this.DISCONTINUED;
      default:
        return type;
    }
  }
});
