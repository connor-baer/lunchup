import { updateUsers, groupUsers, matchUsers, notifyUsers } from './match';

const users = [
  {
    id: 'UUUOKZQSHW',
    name: 'Kali',
    location: 'São Paulo',
    active: true,
    snooze: false
  },
  {
    id: 'UZLJUXTGUQ',
    name: 'Kali',
    location: 'São Paulo',
    active: false,
    snooze: false
  },
  {
    id: 'UODEZVUYLA',
    name: 'Sharee',
    location: 'Berlin',
    active: true,
    snooze: false
  },
  {
    id: 'UWBRNINLQS',
    name: 'Michell',
    location: 'Sofia',
    active: true,
    snooze: false
  },
  {
    id: 'UCZHSCPNEV',
    name: 'Roseanna',
    location: 'São Paulo',
    active: false,
    snooze: false
  },
  {
    id: 'URJCUIYYZV',
    name: 'Lisa',
    location: 'Berlin',
    active: true,
    snooze: false
  },
  {
    id: 'UVRQFDGOBJ',
    name: 'Davina',
    location: 'São Paulo',
    active: false,
    snooze: false
  },
  {
    id: 'UPRZFCNTEF',
    name: 'Cordie',
    location: 'Berlin',
    active: true,
    snooze: false
  },
  {
    id: 'UUPUHBESLV',
    name: 'Mario',
    location: 'Berlin',
    active: true,
    snooze: false
  },
  {
    id: 'UJUIWRKNGD',
    name: 'Thu',
    location: 'Sofia',
    active: true,
    snooze: false
  },
  {
    id: 'UYSUMCUYYC',
    name: 'Jade',
    location: 'São Paulo',
    active: true,
    snooze: false
  },
  {
    id: 'USYEOXUYUP',
    name: 'Celia',
    location: 'São Paulo',
    active: false,
    snooze: false
  },
  {
    id: 'UNNYKWQWNL',
    name: 'Roseanna',
    location: 'Berlin',
    active: false,
    snooze: false
  },
  {
    id: 'ULOANUVPVV',
    name: 'Hosea',
    location: 'São Paulo',
    active: false,
    snooze: false
  },
  {
    id: 'UINKMIQDUZ',
    name: 'Delora',
    location: 'Sofia',
    active: false,
    snooze: false
  },
  {
    id: 'UDVZFAFWSA',
    name: 'Marge',
    location: 'São Paulo',
    active: true,
    snooze: false
  },
  {
    id: 'UTOULZSBNP',
    name: 'Mario',
    location: 'Berlin',
    active: true,
    snooze: false
  },
  {
    id: 'UUPDTXLPSX',
    name: 'Alesha',
    location: 'São Paulo',
    active: true,
    snooze: false
  },
  {
    id: 'UBWIHLDVDN',
    name: 'Marge',
    location: 'São Paulo',
    active: true,
    snooze: false
  },
  {
    id: 'ULFRULVSND',
    name: 'Conchita',
    location: 'São Paulo',
    active: false,
    snooze: false
  },
  {
    id: 'UGBTLKMHQS',
    name: 'Fatimah',
    location: 'Sofia',
    active: false,
    snooze: false
  },
  {
    id: 'UZLNZFSMPM',
    name: 'Arnita',
    location: 'Berlin',
    active: false,
    snooze: false
  },
  {
    id: 'UFPBXATYHE',
    name: 'Marge',
    location: 'Sofia',
    active: false,
    snooze: false
  },
  {
    id: 'UKPPFUPRVW',
    name: 'Dorothy',
    location: 'São Paulo',
    active: false,
    snooze: false
  },
  {
    id: 'UOVNRBIXHF',
    name: 'Cyrstal',
    location: 'Sofia',
    active: true,
    snooze: false
  },
  {
    id: 'UJXAIZYLST',
    name: 'Marge',
    location: 'Sofia',
    active: true,
    snooze: false
  },
  {
    id: 'UCGSFFDNHC',
    name: 'Angla',
    location: 'São Paulo',
    active: false,
    snooze: false
  },
  {
    id: 'ULLLOJELYU',
    name: 'Armand',
    location: 'Sofia',
    active: true,
    snooze: false
  },
  {
    id: 'UXAKBEBCZN',
    name: 'Michell',
    location: 'Berlin',
    active: false,
    snooze: false
  },
  {
    id: 'UBQYPJPNNH',
    name: 'Adell',
    location: 'Berlin',
    active: false,
    snooze: false
  },
  {
    id: 'UCMXFGMEWL',
    name: 'Adell',
    location: 'Berlin',
    active: true,
    snooze: false
  },
  {
    id: 'UVALYJJUCX',
    name: 'Gidget',
    location: 'São Paulo',
    active: false,
    snooze: false
  },
  {
    id: 'UBRWGBCNMY',
    name: 'Evelyn',
    location: 'Sofia',
    active: true,
    snooze: false
  },
  {
    id: 'UCKZXLLLJG',
    name: 'Leone',
    location: 'Sofia',
    active: false,
    snooze: false
  },
  {
    id: 'UZMMNIHCWM',
    name: 'Sarina',
    location: 'São Paulo',
    active: true,
    snooze: false
  },
  {
    id: 'UQBXFTFQUB',
    name: 'Mario',
    location: 'Sofia',
    active: true,
    snooze: false
  },
  {
    id: 'UXTHVAEAXR',
    name: 'Glenna',
    location: 'Berlin',
    active: false,
    snooze: false
  },
  {
    id: 'UPIYLGPVNB',
    name: 'Almeta',
    location: 'Berlin',
    active: false,
    snooze: false
  },
  {
    id: 'ULMONQCAFU',
    name: 'Hosea',
    location: 'Berlin',
    active: true,
    snooze: false
  },
  {
    id: 'UPYXUESDUS',
    name: 'Dagny',
    location: 'São Paulo',
    active: false,
    snooze: false
  },
  {
    id: 'USDYDBOMSI',
    name: 'Hortense',
    location: 'Sofia',
    active: false,
    snooze: false
  },
  {
    id: 'ULYJZWAVDC',
    name: 'Glenna',
    location: 'Berlin',
    active: false,
    snooze: false
  },
  {
    id: 'URXZYQVIDK',
    name: 'Cordie',
    location: 'Berlin',
    active: true,
    snooze: false
  },
  {
    id: 'UQGOOXAQBZ',
    name: 'Roseanna',
    location: 'Sofia',
    active: false,
    snooze: false
  },
  {
    id: 'UFMNULUDON',
    name: 'Elaine',
    location: 'Sofia',
    active: true,
    snooze: false
  },
  {
    id: 'UAWAEIHXQG',
    name: 'Cami',
    location: 'Berlin',
    active: true,
    snooze: false
  },
  {
    id: 'UTEPNISDCU',
    name: 'Jamey',
    location: 'São Paulo',
    active: false,
    snooze: false
  },
  {
    id: 'UNZYEUFBCA',
    name: 'Melita',
    location: 'São Paulo',
    active: true,
    snooze: false
  },
  {
    id: 'USYHUTRQYZ',
    name: 'Abbey',
    location: 'Berlin',
    active: true,
    snooze: false
  },
  {
    id: 'ULMEKGTWEX',
    name: 'Mario',
    location: 'Sofia',
    active: false,
    snooze: false
  }
];

describe('updateUsers should', () => {
  it('return null when no users are provided', () => {
    const result = updateUsers();
    expect(result).toBeFalsy();
  });

  it('return false when only message is provided', () => {
    const result = updateUsers(messageText, undefined);
    expect(result).toBeFalsy();
  });

  it('return false when only words are provided', () => {
    const result = updateUsers(undefined, wordsToMatch);
    expect(result).toBeFalsy();
  });

  it('return false when message does not contain words', () => {
    const result = updateUsers(messageText, wordsNotToMatch);
    expect(result).toBeFalsy();
  });

  it('return true when message updateUsers words', () => {
    const result = updateUsers(messageText, wordsToMatch);
    expect(result).toBeTruthy();
  });
});
