function createNode({ classes = "", html = "", link = "" }) {
  return {
    classes,
    html,
    link
  };
}

const director = createNode({
  classes: "director",
  html: `
      <div class="title">Director of Government Logistics</div>
      <div>Miss Mary CHOW</div>
      <div class="phone">2231 5100</div>
  `
});

const deputy_director = createNode({
  classes: "director",
  html: `
        <div class="title">Deputy Director of Government Logistics</div>
        <div>Miss Helen TANG</div>
        <div class="phone">2231 5101</div>
        `
});

const admin = createNode({
  classes: "division",
  html: `
        <div class="title">Administration Division</div>
        <div>Tony WONG</div>
        <div>Departmental Secretary</div>
        <div class="phone">2231 5115</div>
        <div>&nbsp;</div>
        <div>Accounts Section</div>
        <div>Ms Doris CHEUNG</div>
        <div>Senior Treasury Accountant</div>
        <div class="phone">2231 5168</div>
        `,

});

const management = createNode({
  classes: "division",
  html: `
        <div class="title">Management Services Division</div>
        <div>Supplies Surveys and Stock Verification Section</div>
        <div>Ms Cherry CHOI</div>
        <div>Principal Supplies Officer</div>
        <div class="phone">2231 5345</div>
        <div>&nbsp;</div>
        <div>Systems Administration Section</div>
        <div>Ms Mary LEUNG</div>
        <div>Controller (Land Transport)</div>
        <div class="phone">2231 5147</div>
        `,
});

const procurement = createNode({
  classes: "division",
  html: `
        <div class="title">Procurement Division</div>
        <div>Ms Tina LEUNG</div>
        <div>Controller (Procurement)</div>
        <div class="phone">2231 5226</div>
        `,
});

const supplies = createNode({
  classes: "division ",
  html: `
        <div class="title">Supplies Management Division</div>
        <div>Miss Annie CHEUNG</div>
        <div>Controller (Supplies Management)</div>                        
        <div class="phone">2231 5108</div>
        `
});
const printing = createNode({
  classes: "division ",
  html: `
        <div class="title">Printing Division</div>
        <div>Ms Alice CHAN</div>
        <div>Controller (Printing Services)</div>
        <div class="phone">2564 9502</div>
        `
});

const land_transport = createNode({
  classes: "division ",
  html: `
        <div class="title">Land Transport Division</div>
        <div>Ms May LEUNG</div>
        <div>Controller (Land Transport)</div>
        <div class="phone">2231 5147</div>
        `
});

const data = {
  orgChart_data: {
    options:{
      connector_color:'red'
    },
    root: {
      node: director,
      branches: {
        items: [
          {
            node: deputy_director,            
            branches: {
              vertical_breakpoint: "md",
              items:[
                {
                  node: admin
                },
                {
                  node: management
                },
                {
                  node: procurement
                },
                {
                  node: supplies
                },
                {
                  node: printing
                },
                {
                  node: land_transport
                }
              ]
            }
          }
        ]
      }
    }
  }
};

const app = new Vue({
  el: "#app",
  data
});
