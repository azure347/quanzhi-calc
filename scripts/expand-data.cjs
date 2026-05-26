const fs = require('fs');
const data = JSON.parse(fs.readFileSync('D:/Projects/quanzhi-calc/src/data/majors.json', 'utf8'));

// 1. Add 3 new dimensions
const newDims = [
  {key:'civil_exam',name:'考公难度',funnyName:'能上岸吗',emoji:'📝',description:'考公务员的难度，分越高越难上岸',scoreRange:'0=随便考 → 100=卷到天荒地老',direction:'越高越惨'},
  {key:'overseas_study',name:'留学适配度',funnyName:'能出国吗',emoji:'🌍',description:'申请海外名校的难度，分越高越难出国',scoreRange:'0=随便申名校 → 100=基本申不上',direction:'越高越惨'},
  {key:'entrepreneurship',name:'创业指数',funnyName:'能当老板吗',emoji:'💡',description:'创业的必要性和发展空间，分越高越被迫创业',scoreRange:'0=打工皇帝 → 100=只能自己当老板',direction:'越高越惨'}
];
data.dimensions.push(...newDims);

// 2. Add new scores to existing majors
for (const major of data.majors) {
  for (const tier of Object.values(major.tiers)) {
    for (const sub of Object.values(tier.subfields)) {
      sub.scores.civil_exam = 50;
      sub.scores.overseas_study = 50;
      sub.scores.entrepreneurship = 50;
    }
  }
}

// 3. New majors data
const newMajorsData = [
  {id:'chinese_lit',name:'汉语言文学',aliases:['中文','汉语言','文学'],category:'文科',categoryEmoji:'📚',roast:'你以为在文学海洋里遨游，实际上在简历荒漠里挣扎。毕业找不到工作只能去新东方教作文。',alternatives:[{name:'法学',category:'法学',typical_salary:'6k-12k',is_green_flag:false,roast:'法考比司法考试还难，但至少有点护城河'},{name:'新闻传播',category:'文科',typical_salary:'5k-10k',is_green_flag:false,roast:'传统媒体已死，新媒体内卷到死'}]},
  {id:'history',name:'历史学',aliases:['历史'],category:'史学',categoryEmoji:'🏛️',roast:'研究帝王将相觉得自己洞察一切，结果毕业发现自己的命运就是考公。',alternatives:[{name:'哲学',category:'哲学',typical_salary:'5k-9k',is_green_flag:false,roast:'思辨能力满分，薪资负分'},{name:'社会学',category:'法学',typical_salary:'5k-11k',is_green_flag:false,roast:'研究社会问题，然后自己成为社会问题'}]},
  {id:'philosophy',name:'哲学',aliases:['哲学'],category:'哲学',categoryEmoji:'🤔',roast:'思考人生的意义和价值，然后发现就业市场的意义就是让你思考为什么找不到工作。',alternatives:[{name:'历史学',category:'史学',typical_salary:'4k-8k',is_green_flag:false,roast:'毕业即失业，但能教你如何优雅地躺平'},{name:'政治学',category:'法学',typical_salary:'5k-12k',is_green_flag:false,roast:'能考公，但概率比买彩票高不了多少'}]},
  {id:'english',name:'英语',aliases:['英语','英文'],category:'文科',categoryEmoji:'🌐',roast:'专八过了又怎样？现在翻译被AI吊打，只能去新东方教雅思。',alternatives:[{name:'日语',category:'文科',typical_salary:'5k-11k',is_green_flag:false,roast:'日企衰退中，翻译工作越来越少'},{name:'小语种',category:'文科',typical_salary:'6k-15k',is_green_flag:true,roast:'稀缺语种还能一战，但要看天吃饭'}]},
  {id:'japanese',name:'日语',aliases:['日语','日文'],category:'文科',categoryEmoji:'🗾',roast:'日企没落，赴日留学内卷，赴日工作更难，只能回国当日语老师。',alternatives:[{name:'英语',category:'文科',typical_salary:'5k-12k',is_green_flag:false,roast:'英语老师饱和，但比日语好一点点'},{name:'国际关系',category:'文法',typical_salary:'6k-13k',is_green_flag:false,roast:'听起来高大上，实际就业要看家里有没有背景'}]},
  {id:'law',name:'法学',aliases:['法律','法学'],category:'法学',categoryEmoji:'⚖️',roast:'司考过了是入门，没过是连门都看不到。进了律所发现，红圈所只在传说中。',alternatives:[{name:'会计学',category:'商科',typical_salary:'5k-12k',is_green_flag:true,roast:'CPA考出来，三四十万年薪不是梦'},{name:'汉语言文学',category:'文科',typical_salary:'4k-9k',is_green_flag:false,roast:'万金油专业，什么都能干，什么都不精'}]},
  {id:'finance',name:'金融学',aliases:['金融'],category:'商科',categoryEmoji:'💹',roast:'投行 IBD 听着光鲜，但那是清北复交plus的专利。普通211金融毕业生，人均银行柜员。',alternatives:[{name:'会计学',category:'商科',typical_salary:'5k-15k',is_green_flag:true,roast:'四大会计师事务所，还是有盼头的'},{name:'经济学',category:'商科',typical_salary:'5k-14k',is_green_flag:false,roast:'理论一堆，实践为零'}]},
  {id:'accounting',name:'会计学',aliases:['会计'],category:'商科',categoryEmoji:'🧾',roast:'CPA、ACCA、USCPA...考证考到35岁，才发现自己是个记账的。',alternatives:[{name:'审计',category:'商科',typical_salary:'6k-18k',is_green_flag:true,roast:'审计虽然累，但能攒经验跳企业财务'},{name:'财务管理',category:'商科',typical_salary:'5k-14k',is_green_flag:true,roast:'企业财务比会计多一点技术含量'}]},
  {id:'economics',name:'经济学',aliases:['经济','经济学'],category:'商科',categoryEmoji:'📊',roast:'宏观经济、微观经济、计量经济，经济学家研究怎么赚钱，你研究怎么找工作。',alternatives:[{name:'金融学',category:'商科',typical_salary:'5k-15k',is_green_flag:false,roast:'金融比经济好就业，但门槛也更高'},{name:'市场营销',category:'商科',typical_salary:'5k-12k',is_green_flag:false,roast:'销售类工作还是好找的'}]},
  {id:'marketing',name:'市场营销',aliases:['营销','市场'],category:'商科',categoryEmoji:'📢',roast:'4P理论倒背如流，简历投出去石沉大海。营销的本质是推销，你毕业发现最难推销的是自己。',alternatives:[{name:'广告学',category:'文科',typical_salary:'5k-11k',is_green_flag:false,roast:'广告公司加班多，钱少，但能接触创意'},{name:'电子商务',category:'商科',typical_salary:'5k-13k',is_green_flag:true,roast:'互联网运营还是有点前景的'}]},
  {id:'business_admin',name:'工商管理',aliases:['工商','管理'],category:'商科',categoryEmoji:'🏢',roast:'MBA听着很厉害，但本科工商管理毕业，企业觉得你什么都不会。',alternatives:[{name:'人力资源',category:'商科',typical_salary:'5k-12k',is_green_flag:true,roast:'HR是万金油，哪都需要，但很难赚大钱'},{name:'市场营销',category:'商科',typical_salary:'5k-12k',is_green_flag:false,roast:'和市场、营销混着干'}]},
  {id:'clinical_med',name:'临床医学',aliases:['医学','临床'],category:'医学',categoryEmoji:'🩺',roast:'5年本科+3年硕士+3年博士+3年规培=14年。你同学都退休了你还在规培。',alternatives:[{name:'口腔医学',category:'医学',typical_salary:'15k-40k',is_green_flag:true,roast:'牙医是医学里最爽的方向，学历要求相对低，收入还高'},{name:'护理学',category:'医学',typical_salary:'6k-15k',is_green_flag:true,roast:'护士缺口大，但夜班和医患关系是噩梦'}]},
  {id:'tcm',name:'中医学',aliases:['中医'],category:'医学',categoryEmoji:'🀄',roast:'望闻问切听起来很美，但中西医结合的争议让你毕业就迷茫。',alternatives:[{name:'临床医学',category:'医学',typical_salary:'8k-20k',is_green_flag:true,roast:'西医路子更宽，虽然更卷'},{name:'针灸推拿',category:'医学',typical_salary:'8k-18k',is_green_flag:true,roast:'有一技之长，创业相对容易'}]},
  {id:'nursing',name:'护理学',aliases:['护理'],category:'医学',categoryEmoji:'👩‍⚕️',roast:'白衣天使，听着崇高。但夜班、医患矛盾、工资低，三件套打包带走。',alternatives:[{name:'临床医学',category:'医学',typical_salary:'8k-20k',is_green_flag:true,roast:'临床虽然卷，但职业天花板更高'},{name:'康复治疗',category:'医学',typical_salary:'6k-14k',is_green_flag:true,roast:'康复比护理轻松，但收入也更低'}]},
  {id:'education',name:'教育学',aliases:['教育'],category:'教育',categoryEmoji:'🎓',roast:'研究教育的理论和方法，但当老师需要的不是理论，而是教招考试的运气。',alternatives:[{name:'学前教育',category:'教育',typical_salary:'4k-9k',is_green_flag:false,roast:'幼儿园老师，工资比保育员还低'},{name:'心理学',category:'理学',typical_salary:'5k-12k',is_green_flag:false,roast:'心理咨询师听起来很美，实际需要多年沉淀'}]},
  {id:'pre_education',name:'学前教育',aliases:['幼教'],category:'教育',categoryEmoji:'🧒',roast:'幼儿园老师=高级保姆+老师+保洁+心理咨询师+演员，工资3500-6000。',alternatives:[{name:'教育学',category:'教育',typical_salary:'4k-9k',is_green_flag:false,roast:'考编能上岸就上岸，上不了就转行'},{name:'小学教育',category:'教育',typical_salary:'4k-10k',is_green_flag:true,roast:'小学老师比幼儿园轻松一点'}]},
  {id:'journalism',name:'新闻传播',aliases:['新闻','传播'],category:'文科',categoryEmoji:'📰',roast:'传统媒体已死，新媒体红利期已过。狗咬人不是新闻，人咬狗才上热搜——但你不会咬。',alternatives:[{name:'广播电视编导',category:'艺术',typical_salary:'5k-12k',is_green_flag:false,roast:'电视台工资低，但能积累作品'},{name:'市场营销',category:'商科',typical_salary:'5k-12k',is_green_flag:false,roast:'新媒体运营是新闻毕业生的好去处'}]},
  {id:'film_directing',name:'广播电视编导',aliases:['编导','导演'],category:'艺术',categoryEmoji:'🎬',roast:'拍片拍到硬盘全红，结果甲方一条修改意见让你全部重拍。',alternatives:[{name:'戏剧影视文学',category:'艺术',typical_salary:'4k-10k',is_green_flag:false,roast:'文字工作，比编导更好找文案类工作'},{name:'摄影',category:'艺术',typical_salary:'5k-15k',is_green_flag:false,roast:'独立摄影师听起来很酷，但不稳定'}]},
  {id:'fine_arts',name:'美术学',aliases:['美术'],category:'艺术',categoryEmoji:'🎨',roast:'纯艺毕业=失业或艺术家。艺术家需要伯乐，而伯乐都在拍卖行。',alternatives:[{name:'艺术设计',category:'艺术',typical_salary:'5k-13k',is_green_flag:true,roast:'设计类比纯艺好就业，UI/UX还行'},{name:'书法学',category:'艺术',typical_salary:'4k-10k',is_green_flag:false,roast:'书法老师需求不大，教培也不好做'}]},
  {id:'music',name:'音乐学',aliases:['音乐'],category:'艺术',categoryEmoji:'🎵',roast:'音乐学院毕业=表演艺术或教培。表演没观众，教培被双减。',alternatives:[{name:'音乐表演',category:'艺术',typical_salary:'4k-12k',is_green_flag:false,roast:'乐团机会少，大部分人最后去琴行教课'},{name:'舞蹈学',category:'艺术',typical_salary:'4k-10k',is_green_flag:false,roast:'舞蹈老师也是青春饭，30岁后要转行'}]},
  {id:'dance',name:'舞蹈学',aliases:['舞蹈'],category:'艺术',categoryEmoji:'💃',roast:'舞台是你的梦想，练功房是你的青春，舞蹈老师是你的归宿。',alternatives:[{name:'音乐学',category:'艺术',typical_salary:'4k-10k',is_green_flag:false,roast:'音乐+舞蹈可以教少儿艺术综合课'},{name:'学前教育',category:'教育',typical_salary:'4k-9k',is_green_flag:false,roast:'幼教里会舞蹈很加分'}]},
  {id:'architecture',name:'建筑学',aliases:['建筑'],category:'工学',categoryEmoji:'🏗️',roast:'5年本科读完后发现，建筑行业已经是夕阳行业。设计院降薪，地产暴雷。',alternatives:[{name:'城乡规划',category:'工学',typical_salary:'6k-15k',is_green_flag:true,roast:'规划比建筑好一点点，政府需求稳定'},{name:'风景园林',category:'农学',typical_salary:'5k-12k',is_green_flag:true,roast:'园林设计还有景观市场'}]},
  {id:'urban_plan',name:'城乡规划',aliases:['城规','规划'],category:'工学',categoryEmoji:'🏙️',roast:'城市发展放缓，规划需求下降。甲方爸爸改需求，你改图纸，改到第七版发现回到了第一版。',alternatives:[{name:'建筑学',category:'工学',typical_salary:'6k-15k',is_green_flag:false,roast:'建筑不如规划，但能熬'},{name:'土地资源管理',category:'商科',typical_salary:'5k-12k',is_green_flag:true,roast:'国土系统的事业单位还稳定'}]},
  {id:'landscape',name:'风景园林',aliases:['园林'],category:'农学',categoryEmoji:'🌿',roast:'园林设计听起来很浪漫，实际就是画图+跑工地。甲方说自然一点，你就得改十遍。',alternatives:[{name:'建筑学',category:'工学',typical_salary:'6k-14k',is_green_flag:false,roast:'建筑类还是比园林好就业一点'},{name:'环境设计',category:'艺术',typical_salary:'5k-12k',is_green_flag:true,roast:'室内设计比园林好接私单'}]},
  {id:'aerospace',name:'航天航空',aliases:['航天','航空'],category:'工学',categoryEmoji:'🚀',roast:'大国重器，星辰大海。但对口单位就那么几个，进去靠关系，进去后靠论文。',alternatives:[{name:'能源动力',category:'工学',typical_salary:'6k-16k',is_green_flag:true,roast:'能源行业相对稳定，新能源方向还不错'},{name:'机械工程',category:'工学',typical_salary:'6k-15k',is_green_flag:true,roast:'机械万金油，哪儿都能找到工作'}]},
  {id:'energy',name:'能源动力',aliases:['能动','能源'],category:'工学',categoryEmoji:'⚡',roast:'传统能源过剩，新能源又卷不过CS。电厂倒班是日常，35岁后考虑转什么。',alternatives:[{name:'电气工程',category:'工学',typical_salary:'6k-18k',is_green_flag:true,roast:'电气比能源好就业，国家电网是目标'},{name:'核工程',category:'工学',typical_salary:'8k-20k',is_green_flag:true,roast:'核电待遇不错，但位置偏僻'}]},
  {id:'materials',name:'材料学',aliases:['材料'],category:'工学',categoryEmoji:'🔩',roast:'材料是天坑专业里的天坑专业。读研读博搞科研，出来发现企业需要的只是本科三资企业工艺岗。',alternatives:[{name:'新能源材料',category:'工学',typical_salary:'6k-16k',is_green_flag:true,roast:'锂电、光伏、半导体材料方向相对好就业'},{name:'高分子材料',category:'工学',typical_salary:'5k-14k',is_green_flag:false,roast:'传统高分子，就业还行但工资偏低'}]},
  {id:'env_science',name:'环境科学',aliases:['环境'],category:'理学',categoryEmoji:'🌱',roast:'环境人的理想很丰满，现实是环评报告写到手软，工资却像废水一样稀薄。',alternatives:[{name:'环境工程',category:'工学',typical_salary:'5k-13k',is_green_flag:true,roast:'环境工程比环境科学稍微好一点，能做工程'},{name:'生态学',category:'理学',typical_salary:'4k-10k',is_green_flag:false,roast:'生态学比环境科学还难就业'}]},
  {id:'food_science',name:'食品科学',aliases:['食品'],category:'工科',categoryEmoji:'🍔',roast:'食品专业听着能吃，结果对口工作要么工厂流水线，要么质检员，工资还不如送外卖。',alternatives:[{name:'生物工程',category:'工学',typical_salary:'5k-12k',is_green_flag:false,roast:'生物工程是四大天坑之一，比食品还坑'},{name:'营养学',category:'医学',typical_salary:'5k-12k',is_green_flag:true,roast:'营养师近几年有点热度，但需求还是不大'}]},
  {id:'psychology',name:'心理学',aliases:['心理'],category:'理学',categoryEmoji:'🧠',roast:'你以为能洞察人心，结果毕业发现自己连自己的就业方向都看不清楚。',alternatives:[{name:'教育学',category:'教育',typical_salary:'4k-9k',is_green_flag:false,roast:'教育学能考编，但工资低'},{name:'社会学',category:'法学',typical_salary:'5k-11k',is_green_flag:false,roast:'社会学比心理学还好考公一点'}]},
  {id:'sociology',name:'社会学',aliases:['社科'],category:'法学',categoryEmoji:'👥',roast:'研究社会问题，然后自己成为最大的社会问题——一个找不到工作的社会学毕业生。',alternatives:[{name:'政治学',category:'法学',typical_salary:'5k-12k',is_green_flag:false,roast:'政治学考公还有点岗位'},{name:'社会工作',category:'法学',typical_salary:'4k-8k',is_green_flag:false,roast:'社工工资低，但稳定'}]},
  {id:'political_sci',name:'政治学',aliases:['政治'],category:'法学',categoryEmoji:'🏛️',roast:'研究治国理政之策，毕业后发现自己连自己的人生都管不好。',alternatives:[{name:'国际关系',category:'文法',typical_salary:'6k-14k',is_green_flag:false,roast:'国关听起来高大上，但对口径小'},{name:'行政管理',category:'商科',typical_salary:'5k-12k',is_green_flag:true,roast:'行管考公考编都还行'}]},
  {id:'ir',name:'国际关系',aliases:['国关','外交'],category:'文法',categoryEmoji:'🌏',roast:'国际关系研究的是大国博弈，你研究的是怎么进入外交部——后者比前者难一万倍。',alternatives:[{name:'英语',category:'文科',typical_salary:'5k-12k',is_green_flag:false,roast:'英语是硬通货，比国关就业宽多了'},{name:'政治学',category:'法学',typical_salary:'5k-12k',is_green_flag:false,roast:'政治学和国关一样，口径窄'}]},
  {id:'hr',name:'人力资源',aliases:['人力','人力资源'],category:'商科',categoryEmoji:'👔',roast:'HR听起来是管人的，实际是筛简历的+打电话的+当背锅侠的。',alternatives:[{name:'工商管理',category:'商科',typical_salary:'5k-12k',is_green_flag:false,roast:'工管比HR还万金油，但也更水'},{name:'劳动关系',category:'商科',typical_salary:'5k-11k',is_green_flag:true,roast:'劳关在HR里相对专业一点'}]}
];

const d = {
  employment:60,salary:70,degree_threshold:55,environment:35,prospect:50,transfer_diff:55,civil_exam:65,overseas_study:50,entrepreneurship:50
};
const det = {employment_rate:'约40%从事本专业',avg_salary:'5k-9k/月',typical_roles:'教师、编辑、公务员',work_env_desc:'办公室为主，工作稳定但收入一般',industry_trend:'文科整体就业压力大，依赖个人能力'};

function makeSub(scores, details) {
  return { scores: Object.assign({}, d, scores), details: Object.assign({}, det, details) };
}

for (const nm of newMajorsData) {
  const bSub = {
    '通用': makeSub({employment:65,salary:75,degree_threshold:60,environment:30,prospect:55,transfer_diff:50,civil_exam:70,overseas_study:55,entrepreneurship:45}, {employment_rate:'约40%从事本专业',avg_salary:'5k-9k/月',typical_roles:'教师、编辑、公务员',work_env_desc:'办公室为主',industry_trend:'文科就业压力大'})
  };
  const mSub = {
    '通用': makeSub({employment:50,salary:65,degree_threshold:50,environment:30,prospect:45,transfer_diff:45,civil_exam:60,overseas_study:40,entrepreneurship:50}, {employment_rate:'约50%从事本专业',avg_salary:'7k-12k/月',typical_roles:'高校、出版社、公务员',work_env_desc:'高校或出版社',industry_trend:'硕博扩招，就业竞争加剧'})
  };
  const dSub = {
    '通用': makeSub({employment:40,salary:55,degree_threshold:30,environment:30,prospect:40,transfer_diff:40,civil_exam:35,overseas_study:25,entrepreneurship:55}, {employment_rate:'约55%继续学术',avg_salary:'8k-15k/月',typical_roles:'高校教师、科研人员',work_env_desc:'高校或研究所',industry_trend:'博士就业内卷，非升即走是常态'})
  };

  if (nm.category === '医学') {
    delete bSub['通用'];
    bSub['临床方向'] = makeSub({employment:45,salary:60,degree_threshold:70,environment:50,prospect:45,transfer_diff:65,civil_exam:40,overseas_study:35,entrepreneurship:70}, {employment_rate:'约70%从事医疗',avg_salary:'8k-18k/月',typical_roles:'住院医师',work_env_desc:'医院，夜班是常态',industry_trend:'医疗需求稳定，但培养周期长'});
    bSub['基层方向'] = makeSub({employment:55,salary:75,degree_threshold:55,environment:45,prospect:60,transfer_diff:40,civil_exam:80,overseas_study:60,entrepreneurship:45}, {employment_rate:'约80%从事医疗',avg_salary:'5k-10k/月',typical_roles:'全科医生',work_env_desc:'社区医院',industry_trend:'分级诊疗推进，基层需求大'});
    mSub['通用'] = makeSub({employment:35,salary:50,degree_threshold:55,environment:50,prospect:35,transfer_diff:60,civil_exam:30,overseas_study:30,entrepreneurship:65}, {employment_rate:'约75%从事医疗',avg_salary:'10k-22k/月',typical_roles:'主治医师',work_env_desc:'医院',industry_trend:'医学硕士就业相对较好'});
  }
  if (nm.category === '艺术') {
    delete bSub['通用'];
    bSub['教育方向'] = makeSub({employment:60,salary:80,degree_threshold:60,environment:20,prospect:55,transfer_diff:50,civil_exam:65,overseas_study:55,entrepreneurship:40}, {employment_rate:'约45%从事艺术教育',avg_salary:'4k-9k/月',typical_roles:'艺术培训教师',work_env_desc:'培训机构',industry_trend:'艺术培训有需求，但双减影响课外班'});
    bSub['创作方向'] = makeSub({employment:75,salary:80,degree_threshold:70,environment:30,prospect:60,transfer_diff:55,civil_exam:80,overseas_study:50,entrepreneurship:35}, {employment_rate:'约25%继续创作',avg_salary:'3k-8k/月',typical_roles:'自由艺术家',work_env_desc:'工作室',industry_trend:'纯艺创作就业极难'});
    mSub['通用'] = makeSub({employment:55,salary:70,degree_threshold:55,environment:25,prospect:50,transfer_diff:50,civil_exam:60,overseas_study:40,entrepreneurship:50}, {employment_rate:'约40%从事艺术相关',avg_salary:'6k-13k/月',typical_roles:'艺术教师、设计师',work_env_desc:'艺术机构',industry_trend:'艺术类就业需要资源和人脉'});
  }
  if (nm.id === 'finance' || nm.id === 'accounting') {
    bSub['银行方向'] = makeSub({employment:50,salary:65,degree_threshold:55,environment:25,prospect:50,transfer_diff:55,civil_exam:50,overseas_study:45,entrepreneurship:45}, {employment_rate:'约35%进入银行',avg_salary:'6k-12k/月',typical_roles:'柜员、客户经理',work_env_desc:'银行网点',industry_trend:'银行网点收缩，基层岗位减少'});
    bSub['事务所方向'] = makeSub({employment:45,salary:70,degree_threshold:60,environment:45,prospect:40,transfer_diff:50,civil_exam:55,overseas_study:40,entrepreneurship:50}, {employment_rate:'约50%进入事务所',avg_salary:'6k-15k/月',typical_roles:'审计员、税务顾问',work_env_desc:'会计师事务所，加班多',industry_trend:'四大还是有认可度的'});
  }

  nm.tiers = {
    bachelor: {label:'本科',emoji:'🎓',roast:'本科'+nm.name+'：', subfields: bSub},
    master: {label:'硕士',emoji:'📚',roast:'硕士'+nm.name+'：', subfields: mSub},
    doctor: {label:'博士',emoji:'🔬',roast:'博士'+nm.name+'：', subfields: dSub}
  };

  data.majors.push(nm);
}

fs.writeFileSync('D:/Projects/quanzhi-calc/src/data/majors.json', JSON.stringify(data, null, 2));
console.log('Done. Total majors:', data.majors.length);
console.log('Dimensions:', data.dimensions.length, data.dimensions.map(d=>d.key).join(', '));