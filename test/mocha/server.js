import { should } from 'chai';
should();
import sessionless from 'sessionless-node';
import superAgent from 'superagent';

const baseURL = process.env.SUB_DOMAIN ? `https://${process.env.SUB_DOMAIN}.bdo.allyabase.com/` : 'http://127.0.0.1:3003/';

const get = async function(path) {
  console.info("Getting " + path);
  return await superAgent.get(path).set('Content-Type', 'application/json');
};

const put = async function(path, body) {
  console.info("Putting " + path);
  return await superAgent.put(path).send(body).set('Content-Type', 'application/json');
};

const post = async function(path, body) {
  console.info("Posting " + path);
console.log(body);
  return await superAgent.post(path).send(body).set('Content-Type', 'application/json');
};

const _delete = async function(path, body) {
  //console.info("deleting " + path);
  return await superAgent.delete(path).send(body).set('Content-Type', 'application/json');
};

const hash = "hereisanexampleofahash";
const anotherHash = "hereisasecondhash";
let savedUser = {};
let savedUser2 = {};
let keys = {};
let keys2 = {};
let keysToReturn = {};

it('should register a user', async () => {
  keys = await sessionless.generateKeys((k) => { keysToReturn = k; }, () => {return keysToReturn;});
/*  keys = {
    privateKey: 'd6bfebeafa60e27114a40059a4fe82b3e7a1ddb3806cd5102691c3985d7fa591',
    pubKey: '03f60b3bf11552f5a0c7d6b52fcc415973d30b52ab1d74845f1b34ae8568a47b5f'
  };*/
  const payload = {
    timestamp: new Date().getTime() + '',
    pubKey: keys.pubKey,
    hash,
    bdo: {
      pubKey: keys.pubKey,
      foo: "bar",
      baz: "bop"
    }
  };

  payload.signature = await sessionless.sign(payload.timestamp + payload.pubKey + hash);

  const res = await put(`${baseURL}user/create`, payload);
console.log(res.body);
  savedUser = res.body;
  res.body.uuid.length.should.equal(36);
});

it('should register another user with a public bdo', async () => {
  keys2 = await sessionless.generateKeys((k) => { keysToReturn = k; }, () => {return keysToReturn;});
/*  keys = {
    privateKey: 'd6bfebeafa60e27114a40059a4fe82b3e7a1ddb3806cd5102691c3985d7fa591',
    pubKey: '03f60b3bf11552f5a0c7d6b52fcc415973d30b52ab1d74845f1b34ae8568a47b5f'
  };*/
  const payload = {
    timestamp: new Date().getTime() + '',
    pubKey: keys2.pubKey,
    hash: anotherHash,
    public: true,
    bdo: {
      pubKey: keys2.pubKey,
      foo: "bar",
      baz: "bop",
      public: "pub"
    }
  };

  payload.signature = await sessionless.sign(payload.timestamp + payload.pubKey + anotherHash);

  const res = await put(`${baseURL}user/create`, payload);
console.log(res.body);
  savedUser2 = res.body;
  res.body.uuid.length.should.equal(36);
  
  keysToReturn = keys;
});


it('should update bdo', async () => {
  const timestamp = new Date().getTime() + '';
  const uuid = savedUser.uuid;

  const newBDO = {
    pubKey: keys.pubKey,
    foo: "bar",
    baz: "updated"
  };

  const signature = await sessionless.sign(timestamp + uuid + hash);
  const payload = {
    timestamp, 
    uuid, 
    hash, 
    bdo: newBDO, 
    signature
  };

  const res = await put(`${baseURL}user/${savedUser.uuid}/bdo`, payload);
console.log(res.body);
  res.body.bdo.baz.should.equal("updated");
});

it('should get bdo', async () => {
  const timestamp = new Date().getTime() + '';
  const uuid = savedUser.uuid;

  const signature = await sessionless.sign(timestamp + uuid + hash);

  const res = await get(`${baseURL}user/${uuid}/bdo?timestamp=${timestamp}&signature=${signature}&hash=${hash}`);
console.log(res.body);
  res.body.bdo.baz.should.equal("updated");   
});

it('should update a public bdo', async () => {
  keysToReturn = keys2;
  const timestamp = new Date().getTime() + '';
  const uuid = savedUser2.uuid;

  const newBDO = {
    pubKey: keys2.pubKey,
    foo: "bar",
    baz: "public",
    svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <!-- Sky gradient background -->
  <defs>
    <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#87CEEB;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#E0F6FF;stop-opacity:1" />
    <linearGradient id="textBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.9" />
      <stop offset="100%" style="stop-color:#f0f8ff;stop-opacity:0.8" />
    </linearGradient>
    <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#4682B4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#191970;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="dolphinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#C0C0C0;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#808080;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#696969;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="textBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.9" />
      <stop offset="100%" style="stop-color:#f0f8ff;stop-opacity:0.8" />
    </linearGradient>
  </defs>
  
  <!-- Sky -->
  <rect width="400" height="300" fill="url(#skyGradient)"/>
  
  <!-- Ocean -->
  <rect x="0" y="180" width="400" height="120" fill="url(#oceanGradient)"/>
  
  <!-- Ocean waves -->
  <path d="M0 180 Q50 170 100 180 T200 180 T300 180 T400 180 L400 300 L0 300 Z" fill="url(#oceanGradient)" opacity="0.8"/>
  <path d="M0 190 Q30 185 60 190 T120 190 T180 190 T240 190 T300 190 T360 190 T400 190" stroke="#4169E1" stroke-width="2" fill="none" opacity="0.6"/>
  <path d="M0 200 Q40 195 80 200 T160 200 T240 200 T320 200 T400 200" stroke="#4682B4" stroke-width="1.5" fill="none" opacity="0.4"/>
  
  <!-- Water splashes -->
  <circle cx="180" cy="175" r="3" fill="white" opacity="0.7"/>
  <circle cx="185" cy="170" r="2" fill="white" opacity="0.6"/>
  <circle cx="175" cy="172" r="1.5" fill="white" opacity="0.8"/>
  <circle cx="190" cy="177" r="2.5" fill="white" opacity="0.5"/>
  
  <!-- First Dolphin (main, facing upward) -->
  <g transform="rotate(-35 200 120)">
    <ellipse cx="200" cy="120" rx="45" ry="18" fill="url(#dolphinGradient)"/>
    <ellipse cx="235" cy="95" rx="20" ry="15" fill="url(#dolphinGradient)"/>
    <ellipse cx="250" cy="85" rx="8" ry="6" fill="url(#dolphinGradient)"/>
    <circle cx="235" cy="90" r="3" fill="#000"/>
    <circle cx="236" cy="89" r="1" fill="white"/>
    <path d="M195 105 Q190 85 200 80 Q210 85 205 105" fill="url(#dolphinGradient)"/>
    <path d="M165 135 Q150 125 145 115 Q155 120 160 125 Q155 130 145 135 Q150 140 165 135" fill="url(#dolphinGradient)"/>
    <ellipse cx="210" cy="125" rx="12" ry="6" fill="url(#dolphinGradient)" transform="rotate(-30 210 125)"/>
  </g>
  
  <!-- Second Dolphin (smaller, higher) -->
  <g transform="rotate(-45 120 80) scale(0.7)">
    <ellipse cx="120" cy="80" rx="45" ry="18" fill="url(#dolphinGradient)"/>
    <ellipse cx="155" cy="55" rx="20" ry="15" fill="url(#dolphinGradient)"/>
    <ellipse cx="170" cy="45" rx="8" ry="6" fill="url(#dolphinGradient)"/>
    <circle cx="155" cy="50" r="3" fill="#000"/>
    <circle cx="156" cy="49" r="1" fill="white"/>
    <path d="M115 65 Q110 45 120 40 Q130 45 125 65" fill="url(#dolphinGradient)"/>
    <path d="M85 95 Q70 85 65 75 Q75 80 80 85 Q75 90 65 95 Q70 100 85 95" fill="url(#dolphinGradient)"/>
    <ellipse cx="130" cy="85" rx="12" ry="6" fill="url(#dolphinGradient)" transform="rotate(-30 130 85)"/>
  </g>
  
  <!-- Third Dolphin (smallest, mid-height) -->
  <g transform="rotate(-25 420 100) scale(0.6)">
    <ellipse cx="420" cy="100" rx="45" ry="18" fill="url(#dolphinGradient)"/>
    <ellipse cx="455" cy="75" rx="20" ry="15" fill="url(#dolphinGradient)"/>
    <ellipse cx="470" cy="65" rx="8" ry="6" fill="url(#dolphinGradient)"/>
    <circle cx="455" cy="70" r="3" fill="#000"/>
    <circle cx="456" cy="69" r="1" fill="white"/>
    <path d="M415 85 Q410 65 420 60 Q430 65 425 85" fill="url(#dolphinGradient)"/>
    <path d="M385 115 Q370 105 365 95 Q375 100 380 105 Q375 110 365 115 Q370 120 385 115" fill="url(#dolphinGradient)"/>
    <ellipse cx="430" cy="105" rx="12" ry="6" fill="url(#dolphinGradient)" transform="rotate(-30 430 105)"/>
  </g>
  
  <!-- Text background -->
  <rect x="50" y="265" width="300" height="25" rx="12" ry="12" fill="url(#textBg)" stroke="#333" stroke-width="1"/>
  
  <!-- Caption text -->
  <text x="200" y="280" font-family="serif" font-size="16" text-anchor="middle" fill="#2F4F4F" font-style="italic" stroke="#000" stroke-width="0.5" paint-order="stroke fill">
    "So long, and thanks for all the fish."
  </text>
</svg>`
    /*svg: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="15.849462 24.13063 713.2594 529.14705" width="100%">
  <defs>
    
      
        
      
    
    
      
        
      
    
    
      
        
      
    
  </defs>
  <metadata> Produced by OmniGraffle 7.19.2\n2021-12-30 01:02:28 +0000</metadata>
  <g id="ReLocalize_Creativity" stroke-dasharray="none" fill="none" fill-opacity="1" stroke="none" stroke-opacity="1">
    <title>ReLocalize Creativity</title>
    <g id="ReLocalize_Creativity_Layer_1">
      <title>Layer 1</title>
      <g id="Graphic_209">
        <path d="M 185.88247 421.85497 L 185.7043 255.73837 L 228.6202 255.69234 L 228.79837 421.80894 Z" fill="red"></path>
        <path d="M 185.88247 421.85497 L 185.7043 255.73837 L 228.6202 255.69234 L 228.79837 421.80894 Z" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
        

<a href="#" data-title="PATHWAYS"><text transform="translate(197.603 416.8424) rotate(-90.06145)" fill="white">
          <tspan font-family="Helvetica Neue" font-size="16" font-weight="700" fill="white" x="14.97835" y="16">PATHWAYS</tspan>
        </text></a>


      </g>
      <g id="Graphic_211">
        <path d="M 538.3109 421.8629 L 538.13274 255.7463 L 581.0486 255.70027 L 581.2268 421.81686 Z" fill="red"></path>
        <path d="M 538.3109 421.8629 L 538.13274 255.7463 L 581.0486 255.70027 L 581.2268 421.81686 Z" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
        

<a href="#" data-title="TOOLS"><text transform="translate(550.03144 416.8503) rotate(-90.06145)" fill="white">
          <tspan font-family="Helvetica Neue" font-size="16" font-weight="700" fill="white" x="38.28635" y="16">TOOLS</tspan>
        </text></a>


      </g>
      <g id="Graphic_212">
        <path d="M 303.9322 421.46875 L 303.75403 255.35215 L 346.66993 255.30612 L 346.8481 421.4227 Z" fill="red"></path>
        <path d="M 303.9322 421.46875 L 303.75403 255.35215 L 346.66993 255.30612 L 346.8481 421.4227 Z" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
        

<a href="#" data-title="MENTORS"><text transform="translate(315.65273 416.4562) rotate(-90.06145)" fill="white">
          <tspan font-family="Helvetica Neue" font-size="16" font-weight="700" fill="white" x="20.11035" y="16">MENTORS</tspan>
        </text></a>


      </g>
      <g id="Graphic_213">
        <path d="M 420.8348 422.01107 L 420.6566 255.89447 L 463.5725 255.84844 L 463.7507 421.96504 Z" fill="red"></path>
        <path d="M 420.8348 422.01107 L 420.6566 255.89447 L 463.5725 255.84844 L 463.7507 421.96504 Z" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
        

<a href="#" data-title="METHODS"><text transform="translate(432.5553 416.9985) rotate(-90.06145)" fill="white">
          <tspan font-family="Helvetica Neue" font-size="16" font-weight="700" fill="white" x="19.95835" y="16">METHODS</tspan>
        </text></a>


      </g>
      <g id="Graphic_214">
        <path d="M 655.787 422.5266 L 655.6089 256.41 L 698.5248 256.36396 L 698.7029 422.48056 Z" fill="red"></path>
        <path d="M 655.787 422.5266 L 655.6089 256.41 L 698.5248 256.36396 L 698.7029 422.48056 Z" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
        

<a href="#" data-title="PATTERNS"><text transform="translate(667.5076 417.514) rotate(-90.06145)" fill="white">
          <tspan font-family="Helvetica Neue" font-size="16" font-weight="700" fill="white" x="16.71435" y="16">PATTERNS</tspan>
        </text></a>


      </g>
      <g id="Graphic_221">
        <rect x="15.849462" y="57.71829" width="128" height="29.46411" fill="white"></rect>
        

<a href="#" data-title="One Idea"><text transform="translate(20.849462 62.71829)" fill="black">
          <tspan font-family="Helvetica Neue" font-size="16" font-weight="700" fill="black" x="24.784" y="16">One Idea</tspan>
        </text></a>


      </g>
      <g id="Graphic_227">
        <rect x="185.7043" y="220.87233" width="512.9986" height="38.571167" fill="black"></rect>
        <rect x="185.7043" y="220.87233" width="512.9986" height="38.571167" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></rect>
        

<a href="#" data-title="SEE THE SYSTEMS"><text transform="translate(190.7043 225.80983)" fill="white">
          <tspan font-family="Helvetica Neue" font-size="24" font-weight="700" fill="white" x="140.12731" y="23">SEE THE SYSTEMS</tspan>
        </text></a>


      </g>
      <g id="Graphic_229">
        <rect x="185.7043" y="181.2259" width="512.9986" height="38.571167" fill="#999"></rect>
        <rect x="185.7043" y="181.2259" width="512.9986" height="38.571167" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></rect>
        

<a href="#" data-title="PROGRAMS"><text transform="translate(190.7043 186.1634)" fill="white">
          <tspan font-family="Helvetica Neue" font-size="24" font-weight="700" fill="white" x="180.83131" y="23">PROGRAMS</tspan>
        </text></a>


      </g>
      <g id="Graphic_230">
        <rect x="186.23542" y="142.65473" width="512.1124" height="38.571167" fill="#ccc"></rect>
        <rect x="186.23542" y="142.65473" width="512.1124" height="38.571167" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></rect>
        

<a href="#" data-title="PARTNERS"><text transform="translate(191.23542 147.59223)" fill="black">
          <tspan font-family="Helvetica Neue" font-size="24" font-weight="700" fill="black" x="186.8202" y="23">PARTNERS</tspan>
        </text></a>


      </g>
      <g id="Group_236">
        <g id="Graphic_228">
          <rect x="229.94804" y="25.2059" width="425.1057" height="116.95328" fill="black"></rect>
          <rect x="229.94804" y="25.2059" width="425.1057" height="116.95328" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></rect>
        </g>
        <g id="Graphic_231">
          <path d="M 655.6089 25.445524 L 728.6089 142.3988 L 655.6089 142.3988 Z" fill="black"></path>
          <path d="M 655.6089 25.445524 L 728.6089 142.3988 L 655.6089 142.3988 Z" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
        </g>
        <g id="Graphic_232">
          <path d="M 231.0233 25.445524 L 158.02331 142.3988 L 231.0233 142.3988 Z" fill="black"></path>
          <path d="M 231.0233 25.445524 L 158.02331 142.3988 L 231.0233 142.3988 Z" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></path>
        </g>
      </g>
      <g id="Graphic_234">
        

<a href="#" data-title="RE LOCALIZE"><text transform="translate(334.00852 29.13063)" fill="#de1f00">
          <tspan font-family="Helvetica Neue" font-size="44" font-weight="700" fill="#de1f00" x="79.442" y="43">RE</tspan>
          <tspan font-family="Helvetica Neue" font-size="44" font-weight="700" fill="#de1f00" x="3410605e-19" y="97.27631">LOCALIZE</tspan>
        </text></a>


      </g>
      <g id="Graphic_226">
        <rect x="171.52836" y="421.84946" width="541.3506" height="66.67223" fill="red"></rect>
        <rect x="171.52836" y="421.84946" width="541.3506" height="66.67223" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></rect>
      </g>
      <g id="Graphic_224">
        <rect x="15.849462" y="495.5079" width="128" height="48.92822" fill="white"></rect>
        

<a href="#" data-title="One Million Neighborhoods"><text transform="translate(20.849462 500.5079)" fill="black">
          <tspan font-family="Helvetica Neue" font-size="16" font-weight="700" fill="black" x="16.072" y="16">One Million </tspan>
          <tspan font-family="Helvetica Neue" font-size="16" font-weight="700" fill="black" x=".192" y="35.46411">Neighborhoods</tspan>
        </text></a>


      </g>
      <g id="Graphic_225">
        

<a href="#" data-title="COMMUNICATION PLATFORM"><text transform="translate(325.18046 426.3724)" fill="white">
          <tspan font-family="Helvetica Neue" font-size="24" font-weight="700" fill="white" x="11.095842" y="23">COMMUNICATION</tspan>
          <tspan font-family="Helvetica Neue" font-size="24" font-weight="700" fill="white" x="51.95584" y="51.69617">PLATFORM</tspan>
        </text></a>


      </g>
      <g id="Graphic_235">
        <rect x="171.7043" y="489.9951" width="541.17464" height="62.78258" fill="black"></rect>
        <rect x="171.7043" y="489.9951" width="541.17464" height="62.78258" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"></rect>
      </g>
      <g id="Graphic_233">
        

<a href="#" data-title="CREATIVITY"><text transform="translate(304.45614 492.8339)" fill="#de1f00">
          <tspan font-family="Helvetica Neue" font-size="44" font-weight="700" fill="#de1f00" x="42632564e-20" y="43">CREATIVITY</tspan>
        </text></a>


      </g>
    </g>
  </g>
</svg>
`*/
  };

  const signature = await sessionless.sign(timestamp + uuid + anotherHash);
  const payload = {
    timestamp, 
    uuid, 
    hash: anotherHash, 
    bdo: newBDO,
    public: true,
    pubKey: keys2.pubKey, 
    signature
  };

  const res = await put(`${baseURL}user/${savedUser2.uuid}/bdo`, payload);
console.log(res.body);
  res.body.bdo.baz.should.equal("public");
  keysToReturn = keys;
});

it('should get a public bdo', async () => {
  keysToReturn = keys;
  const timestamp = new Date().getTime() + '';
  const uuid = savedUser.uuid;

  const signature = await sessionless.sign(timestamp + uuid + hash);

  const res = await get(`${baseURL}user/${uuid}/bdo?timestamp=${timestamp}&signature=${signature}&hash=${hash}&pubKey=${keys2.pubKey}`);
console.log(res.body);
  res.body.bdo.baz.should.equal("public");   
});

it('should put bases', async () => {
  const timestamp = new Date().getTime() + '';
  const uuid = savedUser.uuid;
  const baseId = sessionless.generateUUID();
  const baseId2 = sessionless.generateUUID();

  const bases = {};
  bases[baseId] = {
    name: 'ent',
    description: 'A development server located in Germany',
    location: {
      latitude: 51.0,
      longitude: 9.0,
      postalCode: '16'
    },
    soma: {
      lexary: [
        'art',
        'film'
      ],
      photary: [
        'dogs'
      ],
      viewary: [
        'rip the system'
      ]
    },
    dns: {
      dolores: 'https://ent.dolores.allyabase.com/'
    },
    joined: false
  };

  bases[baseId2] = {
    name: 'ind',
    description: 'A development server located in India',
    location: {
      latitude: 21.77,
      longitude: 78.87,
      postalCode: '804419'
    },
    soma: {
      lexary: [
        'music',
        'food'
      ],
      photary: [
        'birds'
      ],
      viewary: [
        'rip the system'
      ]
    },
    dns: {
      dolores: 'https://ind.dolores.allyabase.com/'
    },
    joined: false
  };

  const payload = {
    timestamp,
    uuid,
    hash,
    bases
  };

  payload.signature = await sessionless.sign(timestamp + uuid + hash);

  const res = await put(`${baseURL}user/${uuid}/bases`, payload);

console.log('bases are', res.body);
  Object.keys(res.body.bases).length.should.not.equal(0);
});

it('should get bases', async () => {
  const timestamp = new Date().getTime() + '';
  const uuid = savedUser.uuid;

  const signature = await sessionless.sign(timestamp + uuid + hash);

  const res = await get(`${baseURL}user/${uuid}/bases?timestamp=${timestamp}&signature=${signature}&hash=${hash}`);

console.log('res.body for getting bases', res.body);
  Object.keys(res.body.bases).length.should.not.equal(0);
});

it('should get spellbooks', async () => {
  const timestamp = new Date().getTime() + '';
  const uuid = savedUser.uuid;

  const signature = await sessionless.sign(timestamp + uuid + hash);

  const res = await get(`${baseURL}user/${uuid}/spellbooks?timestamp=${timestamp}&signature=${signature}&hash=${hash}`);

  res.body.spellbooks.length.should.not.equal(0);
});

it('should teleport', async () => {
  const timestamp = new Date().getTime() + '';
  const uuid = savedUser.uuid;

  const signature = await sessionless.sign(timestamp + uuid + hash);

  const res = await get(`${baseURL}user/${uuid}/teleport?timestamp=${timestamp}&signature=${signature}&hash=${hash}&url=https%3A%2F%2Fpeaceloveandredistribution.com%2Fa-brief-history-of-teleportation%3FpubKey%3D023031231f669c6504ef5939b6b5e22d2d8be76cf46e98297b810138933de2494f`);

  res.body.valid.should.equal(true);
});

it('should delete a user', async () => {
  const timestamp = new Date().getTime() + '';
  const uuid = savedUser.uuid;

  const signature = await sessionless.sign(timestamp + uuid + hash);
  const payload = {timestamp, uuid, hash, signature};


  const res = await _delete(`${baseURL}user/delete`, payload);
console.log(res.body);
  res.status.should.equal(200);
});

it('should delete another user', async () => {
  keysToReturn = keys2;
  const timestamp = new Date().getTime() + '';
  const uuid = savedUser2.uuid;

  const signature = await sessionless.sign(timestamp + uuid + anotherHash);
  const payload = {timestamp, uuid, hash: anotherHash, signature};


  const res = await _delete(`${baseURL}user/delete`, payload);
console.log(res.body);
  res.status.should.equal(200);
});
