const fs = require('fs');
const data = JSON.parse(fs.readFileSync('D:/Projects/quanzhi-calc/src/data/majors.json', 'utf8'));

const d = {employment:60,salary:70,degree_threshold:55,environment:35,prospect:50,transfer_diff:55,civil_exam:65,overseas_study:50,entrepreneurship:50};
const det = {employment_rate:'约40%从事本专业',avg_salary:'5k-9k/月',typical_roles:'翻译、教师、外企',work_env_desc:'办公室或教育机构',industry_trend:'AI冲击翻译行业，小语种相对稳定'};

function makeSub(scores, details) {
  return { scores: Object.assign({}, d, scores), details: Object.assign({}, det, details) };
}

const newLangMajors = [
  {id:'russian',name:'俄语',aliases:['俄文','俄语专业'],category:'文科',categoryEmoji:'🇷🇺',roast:'俄语区经济衰退，普京都没钱了你还指望俄语就业？毕业要么去东北做边境贸易，要么转行。',alternatives:[{name:'法语',category:'文科',typical_salary:'5k-12k',is_green_flag:true,roast:'法语区经济还行，非洲市场带动需求'},{name:'德语',category:'文科',typical_salary:'6k-14k',is_green_flag:true,roast:'德国企业多，就业相对较好'}]},
  {id:'french',name:'法语',aliases:['法文','法语专业'],category:'文科',categoryEmoji:'🇫🇷',roast:'法语号称最浪漫的语言，但你毕业后的处境可能比法国经济还浪漫——充满不确定。',alternatives:[{name:'西班牙语',category:'文科',typical_salary:'5k-13k',is_green_flag:true,roast:'西班牙语区广阔，南美市场大'},{name:'葡萄牙语',category:'文科',typical_salary:'6k-14k',is_green_flag:true,roast:'巴西金砖国家，葡语人才稀缺'}]},
  {id:'german',name:'德语',aliases:['德文','德语专业'],category:'文科',categoryEmoji:'🇩🇪',roast:'大众裁员、奔驰销量下滑、德国制造神话不再——你学德语的时候，行业天花板塌了。',alternatives:[{name:'机械工程',category:'工学',typical_salary:'6k-15k',is_green_flag:true,roast:'会德语的工程师比纯德语生好就业'},{name:'日语',category:'文科',typical_salary:'5k-11k',is_green_flag:false,roast:'日企虽然也不好，但比德企多'}]},
  {id:'spanish',name:'西班牙语',aliases:['西班牙文','西语'],category:'文科',categoryEmoji:'🇪🇸',roast:'西语是世界上第二大母语，但西班牙和拉美经济一个比一个拉胯，你中西互通也救不了就业。',alternatives:[{name:'葡萄牙语',category:'文科',typical_salary:'6k-14k',is_green_flag:true,roast:'巴西市场大，葡语和西语接近'},{name:'法语',category:'文科',typical_salary:'5k-12k',is_green_flag:true,roast:'法语非洲扩张，比西语更有前途'}]},
  {id:'korean',name:'韩语',aliases:['朝鲜语','韩文','韩语专业'],category:'文科',categoryEmoji:'🇰🇷',roast:'韩流退热，三星裁员，LG卖身——你还在学韩语？你是来搞笑的吧。',alternatives:[{name:'日语',category:'文科',typical_salary:'5k-11k',is_green_flag:false,roast:'日本虽然也不景气，但比韩国好一点'},{name:'英语',category:'文科',typical_salary:'5k-12k',is_green_flag:false,roast:'英语永远比韩语有用'}]},
  {id:'arabic',name:'阿拉伯语',aliases:['阿语','阿拉伯文'],category:'文科',categoryEmoji:'🇸🇦',roast:'学阿语去中东？能去的前提是你家里有路子。普通人学阿语毕业≈失业。',alternatives:[{name:'波斯语',category:'文科',typical_salary:'6k-14k',is_green_flag:false,roast:'伊朗被制裁，波斯语就业更窄'},{name:'土耳其语',category:'文科',typical_salary:'5k-12k',is_green_flag:false,roast:'土耳其经济一团糟'}]},
  {id:'portuguese',name:'葡萄牙语',aliases:['葡语','葡萄牙文'],category:'文科',categoryEmoji:'🇵🇹',roast:'葡萄牙语听起来很美，但你葡语水平再好也拼不过巴西人。除非你去安哥拉，不然基本白学。',alternatives:[{name:'西班牙语',category:'文科',typical_salary:'5k-13k',is_green_flag:true,roast:'西语比葡语就业面广得多'},{name:'法语',category:'文科',typical_salary:'5k-12k',is_green_flag:true,roast:'法语在非洲有广阔市场'}]},
  {id:'italian',name:'意大利语',aliases:['意语','意大利文'],category:'文科',categoryEmoji:'🇮🇹',roast:'意甲、时尚、设计——你以为会意大利语就能进这些行业？想多了，人家要的是技能不是语言。',alternatives:[{name:'法语',category:'文科',typical_salary:'5k-12k',is_green_flag:true,roast:'法语比意大利语好就业多了'},{name:'艺术设计',category:'艺术',typical_salary:'5k-13k',is_green_flag:true,roast:'设计技能比语言更吃香'}]},
  {id:'thai',name:'泰语',aliases:['泰文'],category:'文科',categoryEmoji:'🇹🇭',roast:'泰语？你想去泰国做导游吗？还是去华为东南亚搬砖？就业方向屈指可数。',alternatives:[{name:'越南语',category:'文科',typical_salary:'5k-11k',is_green_flag:true,roast:'越南制造业崛起，越语有刚需'},{name:'缅甸语',category:'文科',typical_salary:'5k-12k',is_green_flag:false,roast:'缅甸市场太小'}]},
  {id:'vietnamese',name:'越南语',aliases:['越语','越南文'],category:'文科',categoryEmoji:'🇻🇳',roast:'越南制造业外迁，就业机会有，但工资低得可怜。你翻译的文件比你的工资值钱。',alternatives:[{name:'泰语',category:'文科',typical_salary:'5k-11k',is_green_flag:false,roast:'泰国旅游市场更大'},{name:'印尼语',category:'文科',typical_salary:'5k-12k',is_green_flag:true,roast:'印尼是东南亚最大市场'}]},
  {id:'persian',name:'波斯语',aliases:['伊朗语','波斯文'],category:'文科',categoryEmoji:'🇮🇷',roast:'伊朗被制裁，荷rozen制裁，你学波斯语能去哪？除了外贸公司偶尔需要，你基本没有对口就业。',alternatives:[{name:'阿拉伯语',category:'文科',typical_salary:'5k-12k',is_green_flag:false,roast:'阿拉伯语比波斯语需求更多'},{name:'土耳其语',category:'文科',typical_salary:'5k-12k',is_green_flag:false,roast:'土耳其市场更大'}]},
  {id:'turkish',name:'土耳其语',aliases:['土语','土耳其文'],category:'文科',categoryEmoji:'🇹🇷',roast:'土耳其经济崩溃，埃尔多安在表演疯狂经济学，你的土语就业市场比他家货币还惨。',alternatives:[{name:'阿拉伯语',category:'文科',typical_salary:'5k-12k',is_green_flag:false,roast:'阿拉伯语在中东更通用'},{name:'波斯语',category:'文科',typical_salary:'5k-12k',is_green_flag:false,roast:'波斯语和土语一样小众'}]},
  {id:'indonesian',name:'印尼语',aliases:['印尼文','马来语'],category:'文科',categoryEmoji:'🇮🇩',roast:'印尼语听着很偏，但东南亚是制造业转移的最大受益者。不过你得先能去印尼工作。',alternatives:[{name:'越南语',category:'文科',typical_salary:'5k-11k',is_green_flag:true,roast:'越南产业链更成熟'},{name:'泰语',category:'文科',typical_salary:'5k-11k',is_green_flag:false,roast:'泰国旅游带动泰语需求更大'}]},
  {id:'ukrainian',name:'乌克兰语',aliases:['乌语','乌克兰文'],category:'文科',categoryEmoji:'🇺🇦',roast:'俄乌战争还在打，你学乌克兰语？等战争结束再学也不迟。现在去那儿上班？',alternatives:[{name:'俄语',category:'文科',typical_salary:'4k-10k',is_green_flag:false,roast:'俄语比乌克兰语用处广多了'},{name:'波兰语',category:'文科',typical_salary:'5k-12k',is_green_flag:true,roast:'波兰是欧洲经济黑马，波语有前景'}]},
  {id:'polish',name:'波兰语',aliases:['波语','波兰文'],category:'文科',categoryEmoji:'🇵🇱',roast:'波兰是欧洲经济黑马，但学波兰语的人极少，招聘需求也极少。物以稀为贵？不，你只是稀有而已。',alternatives:[{name:'德语',category:'文科',typical_salary:'6k-14k',is_green_flag:true,roast:'德语比波兰语用途广得多'},{name:'捷克语',category:'文科',typical_salary:'5k-12k',is_green_flag:false,roast:'捷克语更小众'}]},
  {id:'dutch',name:'荷兰语',aliases:['荷语','荷兰文'],category:'文科',categoryEmoji:'🇳🇱',roast:'荷兰语？你要去荷兰留学还是工作？荷兰语使用人数极少，就业方向窄得离谱。',alternatives:[{name:'德语',category:'文科',typical_salary:'6k-14k',is_green_flag:true,roast:'德语比荷兰语有用太多'},{name:'英语',category:'文科',typical_salary:'5k-12k',is_green_flag:false,roast:'英语在任何地方都比荷兰语有用'}]},
  {id:'hebrew',name:'希伯来语',aliases:['希伯来文','以色列语'],category:'文科',categoryEmoji:'🇮🇱',roast:'学希伯来语去以色列？你是创业者还是研究者？普通人学这个基本等于自娱自乐。',alternatives:[{name:'阿拉伯语',category:'文科',typical_salary:'5k-12k',is_green_flag:false,roast:'阿拉伯语比希伯来语用途更广'},{name:'英语',category:'文科',typical_salary:'5k-12k',is_green_flag:false,roast:'英语还是最通用的'}]},
  {id:'hindi',name:'印地语',aliases:['印地文','印度语'],category:'文科',categoryEmoji:'🇮🇳',roast:'印度经济崛起，但印地语？你的对口就业要么是驻印中国企业，要么是驻华印企。前者少，后者更少。',alternatives:[{name:'英语',category:'文科',typical_salary:'5k-12k',is_green_flag:false,roast:'英语在印度比印地语更通用'},{name:'越南语',category:'文科',typical_salary:'5k-11k',is_green_flag:true,roast:'东南亚制造业比印度更有机会'}]},
  {id:'swahili',name:'斯瓦希里语',aliases:['斯瓦希里文'],category:'文科',categoryEmoji:'🇰🇪',roast:'斯瓦希里语？同学你是什么情怀？你是去做中非贸易还是去非洲做慈善？就业方向屈指可数。',alternatives:[{name:'法语',category:'文科',typical_salary:'5k-12k',is_green_flag:true,roast:'法语在非洲通用，斯语只是情怀'},{name:'阿拉伯语',category:'文科',typical_salary:'5k-12k',is_green_flag:false,roast:'阿拉伯语在非洲更有用'}]},
  {id:'hungarian',name:'匈牙利语',aliases:['匈语','匈牙利文'],category:'文科',categoryEmoji:'🇭🇺',roast:'学匈牙利语？你知道全世界说匈牙利语的人有多少吗？大约1000万。这个数字连匈牙利自己都养不活几个翻译。',alternatives:[{name:'德语',category:'文科',typical_salary:'6k-14k',is_green_flag:true,roast:'德语在匈牙利也很通用'},{name:'英语',category:'文科',typical_salary:'5k-12k',is_green_flag:false,roast:'英语比匈牙利语有用得多'}]},
];

for (const nm of newLangMajors) {
  const bSub = {
    '通用': makeSub({employment:65,salary:75,degree_threshold:60,environment:30,prospect:55,transfer_diff:50,civil_exam:70,overseas_study:55,entrepreneurship:45}, {employment_rate:'约35%从事语言相关',avg_salary:'5k-10k/月',typical_roles:'翻译、外贸、教师',work_env_desc:'办公室或教育机构',industry_trend:'小语种需求稳定但竞争激烈'}),
  };
  const mSub = {
    '通用': makeSub({employment:50,salary:65,degree_threshold:50,environment:30,prospect:45,transfer_diff:45,civil_exam:60,overseas_study:40,entrepreneurship:50}, {employment_rate:'约45%从事语言相关',avg_salary:'7k-13k/月',typical_roles:'高级翻译、外企、教育',work_env_desc:'外企或高校',industry_trend:'硕博小语种人才稀缺，但岗位也少'}),
  };
  const dSub = {
    '通用': makeSub({employment:40,salary:55,degree_threshold:30,environment:30,prospect:40,transfer_diff:40,civil_exam:35,overseas_study:25,entrepreneurship:55}, {employment_rate:'约50%继续学术',avg_salary:'8k-15k/月',typical_roles:'高校教师、研究人员',work_env_desc:'高校或研究所',industry_trend:'小语种学术研究岗位极少，非升即走'}),
  };
  nm.tiers = {
    bachelor: {label:'本科',emoji:'🎓',roast:'本科'+nm.name+'：', subfields: bSub},
    master: {label:'硕士',emoji:'📚',roast:'硕士'+nm.name+'：', subfields: mSub},
    doctor: {label:'博士',emoji:'🔬',roast:'博士'+nm.name+'：', subfields: dSub}
  };
  data.majors.push(nm);
}

fs.writeFileSync('D:/Projects/quanzhi-calc/src/data/majors.json', JSON.stringify(data, null, 2));
console.log('Done. Total majors:', data.majors.length);