// آزمایشگاه مجموعه‌های ریاضی - script.js - V.4.42

const AppState = {
    sets: new Map(),
    nextSetId: 1,
    universalSets: {
        'ℕ': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        '𝕎': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        'ℤ': [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        'ℚ': [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3, 0.333, 0.666, 0.25, 0.75],
        'ℝ': [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3, Math.PI, Math.E, Math.sqrt(2)],
        'ℚ′': [Math.PI, Math.E, Math.sqrt(2), Math.sqrt(3), Math.sqrt(5), Math.sqrt(7)]
    },
    infiniteSetsInfo: {
        'ℕ': '⚠️ مجموعه اعداد طبیعی (ℕ) یک مجموعه نامتناهی است. فقط اعداد ۱ تا ۲۰ به عنوان نمونه نمایش داده می‌شوند.',
        '𝕎': '⚠️ مجموعه اعداد حسابی (𝕎) یک مجموعه نامتناهی است. فقط اعداد ۰ تا ۲۰ به عنوان نمونه نمایش داده می‌شوند.',
        'ℤ': '⚠️ مجموعه اعداد صحیح (ℤ) یک مجموعه نامتناهی است. فقط اعداد -۱۰ تا ۱۰ به عنوان نمونه نمایش داده می‌شوند.',
        'ℚ': '⚠️ مجموعه اعداد گویا (ℚ) یک مجموعه نامتناهی و چگال است. فقط یک زیرمجموعه نمونه نمایش داده می‌شود.',
        'ℝ': '⚠️ مجموعه اعداد حقیقی (ℝ) یک مجموعه نامتناهی و ناشمارا است. فقط یک زیرمجموعه نمونه نمایش داده می‌شود.',
        'ℚ′': '⚠️ مجموعه اعداد گنگ (ℚ′) یک مجموعه نامتناهی و ناشمارا است. فقط چند نمونه از اعداد گنگ معروف نمایش داده می‌شود.'
    }
};

function isInUniversalSet(num, setName) {
    if (typeof num !== 'number' || isNaN(num)) return false;
    switch(setName) {
        case 'ℕ': return Number.isInteger(num) && num >= 1;
        case '𝕎': return Number.isInteger(num) && num >= 0;
        case 'ℤ': return Number.isInteger(num);
        case 'ℚ': return typeof num === 'number' && isFinite(num);
        case 'ℝ': return typeof num === 'number' && isFinite(num);
        case 'ℚ′': return typeof num === 'number' && isFinite(num) && !Number.isInteger(num);
        default: return false;
    }
}

function isSubsetOfUniversal(setNameA, setNameB) {
    const hierarchy = { 'ℕ': 1, '𝕎': 2, 'ℤ': 3, 'ℚ': 4, 'ℝ': 5, 'ℚ′': 6 };
    if (setNameA === setNameB) return true;
    if (setNameA === 'ℚ′' && setNameB === 'ℝ') return true;
    return (hierarchy[setNameA] || 0) < (hierarchy[setNameB] || 0);
}

function getSubsetReason(a, b) {
    const reasons = {
        'ℕ_ℤ': 'همه اعداد طبیعی جزو اعداد صحیح هستند.',
        'ℕ_ℝ': 'همه اعداد طبیعی جزو اعداد حقیقی هستند.',
        'ℕ_ℚ': 'همه اعداد طبیعی جزو اعداد گویا هستند.',
        '𝕎_ℤ': 'همه اعداد حسابی جزو اعداد صحیح هستند.',
        '𝕎_ℝ': 'همه اعداد حسابی جزو اعداد حقیقی هستند.',
        'ℤ_ℚ': 'همه اعداد صحیح جزو اعداد گویا هستند.',
        'ℤ_ℝ': 'همه اعداد صحیح جزو اعداد حقیقی هستند.',
        'ℚ_ℝ': 'همه اعداد گویا جزو اعداد حقیقی هستند.',
        'ℚ′_ℝ': 'همه اعداد گنگ جزو اعداد حقیقی هستند.',
        'ℕ_𝕎': 'همه اعداد طبیعی جزو اعداد حسابی هستند.'
    };
    return reasons[a + '_' + b] || `${a} ⊆ ${b} طبق سلسله‌مراتب.`;
}

function getNotSubsetReason(a, b) {
    const reasons = {
        'ℤ_ℕ': 'اعداد ۰ و منفی در ℤ هستند ولی در ℕ نیستند.',
        'ℝ_ℕ': 'اعداد منفی و اعشاری در ℝ هستند ولی در ℕ نیستند.',
        'ℝ_ℤ': 'اعداد اعشاری در ℝ هستند ولی در ℤ نیستند.',
        'ℚ_ℤ': 'کسرها در ℚ هستند ولی در ℤ نیستند.',
        '𝕎_ℕ': 'عدد ۰ در 𝕎 هست ولی در ℕ نیست.',
        'ℚ′_ℚ': 'اعداد گنگ در ℚ′ هستند ولی در ℚ نیستند.'
    };
    return reasons[a + '_' + b] || `اعضایی در ${a} وجود دارد که در ${b} نیستند.`;
}

const HistoryManager = {
    history: [],
    currentIndex: -1,
    maxHistorySize: 20,
    getCurrentStateForHistory() { return { sets: Array.from(AppState.sets.entries()), nextSetId: AppState.nextSetId }; },
    pushState(state) { const cs=JSON.stringify(this.getCurrentStateForHistory()),ns=JSON.stringify(state); if(cs===ns)return; this.history=this.history.slice(0,this.currentIndex+1); const sc={sets:Array.from(state.sets.entries()),nextSetId:state.nextSetId,timestamp:Date.now()}; this.history.push(sc); if(this.history.length>this.maxHistorySize)this.history.shift(); this.currentIndex=this.history.length-1; this.updateUndoButton(); },
    undo() { if(this.currentIndex>0){this.currentIndex--;const s=this.history[this.currentIndex];this.restoreState(s);return s;} return null; },
    restoreState(s) { AppState.sets=new Map(s.sets); AppState.nextSetId=s.nextSetId; StorageManager.saveState(); this.updateUndoButton(); updateStats(); },
    updateUndoButton() { const b=document.getElementById('undoBtn'); if(b)b.disabled=this.currentIndex<=0; },
    clearHistory() { this.history=[]; this.currentIndex=-1; this.updateUndoButton(); }
};

const InputTracker = {
    activeInput: null,
    init() { document.addEventListener('focusin',(e)=>{if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'){this.activeInput=e.target;}}); },
    getActiveInput() { const ta=document.activeElement; if(ta&&(ta.tagName==="INPUT"||ta.tagName==="TEXTAREA")){this.activeInput=ta;return ta;} return this.activeInput; }
};

const StorageManager = {
    STORAGE_KEY: 'setLabState_v2',
    saveState() { try{const s={...HistoryManager.getCurrentStateForHistory(),version:'2.0',lastSaved:Date.now()}; localStorage.setItem(this.STORAGE_KEY,JSON.stringify(s)); return true; }catch(e){return false;} },
    clearAllData() { try{localStorage.removeItem(this.STORAGE_KEY);}catch(e){} }
};

function hasUniversalSet(expr) { return /[ℕ𝕎ℤℚℝℚ′]/.test(expr) || /طبیعی|حسابی|صحیح|گویا|حقیقی|گنگ/.test(expr); }
function isOneSidedCondition(expr) { const cl=expr.replace(/\s+/g,''); const nums=cl.match(/-?\d+(\.\d+)?/g)||[]; const un=[...new Set(nums.map(Number))]; if(un.length>=2){const fi=cl.search(/-?\d/); const ln=cl.match(/-?\d+(\.\d+)?/g)?.pop()||''; const li=cl.lastIndexOf(ln); const xi=cl.indexOf('x'); if(xi>-1&&fi<xi&&xi<li)return false; if(/(\d)[<>≤≥]=?x[<>≤≥]=?(\d)/.test(cl))return false;} if(un.length<=1&&hasUniversalSet(expr))return true; return hasUniversalSet(expr)&&!/(\d)[<>≤≥]=?x[<>≤≥]=?(\d)/.test(cl); }
function detectConditionDirection(expr) { const cl=expr.replace(/\s+/g,''); let d='none',t=null; const pts=[{regex:/x>=(-?\d+\.?\d*)/,dir:'>='},{regex:/x≥(-?\d+\.?\d*)/,dir:'>='},{regex:/x>(-?\d+\.?\d*)/,dir:'>'},{regex:/x<=(-?\d+\.?\d*)/,dir:'<='},{regex:/x≤(-?\d+\.?\d*)/,dir:'<='},{regex:/x<(-?\d+\.?\d*)/,dir:'<'}]; for(const p of pts){const m=cl.match(p.regex); if(m){d=p.dir;t=parseFloat(m[1]);break;}} return {direction:d,threshold:t}; }
function generateInfiniteSample(sn,dir,th,count=10) { const s=[]; if(sn==='ℤ'||sn==='ℕ'||sn==='𝕎'){if(dir==='>='||dir==='>'){let st=dir==='>'?Math.ceil(th+1):Math.ceil(th); if(sn==='ℕ'&&st<1)st=1; if(sn==='𝕎'&&st<0)st=0; for(let i=0;i<count;i++)s.push(st+i);}else if(dir==='<='||dir==='<'){let st=dir==='<'?Math.floor(th-1):Math.floor(th); if(sn==='ℕ'&&st<1)st=1; if(sn==='𝕎'&&st<0)st=0; for(let i=0;i<count;i++){s.push(st-i);} s.reverse();}} return s; }

function formatInfiniteSet(elements, infinityType = 'none') {
    if(!elements || elements.length === 0) return '{ ... }';
    
    const sorted = [...elements].sort((a,b) => a - b);
    const maxDisplay = 10;
    let display = sorted.slice(0, maxDisplay);
    
    if(infinityType === 'left') {
        return `{ ..., ${display.join(', ')} }`;
    } else if(infinityType === 'right') {
        return `{ ${display.join(', ')}, ... }`;
    } else if(infinityType === 'both') {
        return `{ ..., ${display.join(', ')}, ... }`;
    } else {
        if(sorted.length > maxDisplay) {
            return `{ ${display.join(', ')}, ... (${sorted.length} عضو) }`;
        }
        return `{ ${sorted.join(', ')} }`;
    }
}

// ===== توابع جدید برای تشخیص نوع مجموعه =====

function detectSetType(elements, expression) {
    const l = expression.toLowerCase();
    const count = elements.length;
    
    // بررسی وجود کران بالا و پایین با regex
    const hasBothBounds = /(\d+)\s*[<>≤≥]=?\s*x\s*[<>≤≥]=?\s*(\d+)/.test(l) ||
                          /x\s*[<>≤≥]=?\s*(\d+).*[<>≤≥]=?\s*(\d+)/.test(l);
    
    // اگر هر دو کران داشته باشد → متناهی
    if (hasBothBounds || (l.includes('بین') && l.includes('تا'))) {
        if (count > 20) {
            return { type: 'large_finite', message: '⚠️ تعداد اعضای مجموعه زیاد است، همه را نمی‌توان نوشت' };
        }
        return { type: 'finite', message: '' };
    }
    
    // اگر فقط کران پایین داشته باشد (بزرگتر از) → نامتناهی (سمت راست)
    if ((l.includes('بزرگتر') || l.includes('بیشتر') || /x\s*[>≥]/.test(l)) && !l.includes('تا') && !l.includes('بین')) {
        return { type: 'infinite_right', message: '⚠️ مجموعه نامتناهی است' };
    }
    
    // اگر فقط کران بالا داشته باشد (کوچکتر از) → نامتناهی (سمت چپ)
    if ((l.includes('کوچکتر') || l.includes('کمتر') || /x\s*[<≤]/.test(l)) && !l.includes('تا') && !l.includes('بین')) {
        return { type: 'infinite_left', message: '⚠️ مجموعه نامتناهی است' };
    }
    
    // مجموعه‌های جهانی بدون کران → دو طرف نامتناهی
    if (l.includes('ℤ') || l.includes('صحیح') || l.includes('ℕ') || l.includes('طبیعی') || 
        l.includes('ℝ') || l.includes('حقیقی') || l.includes('ℚ') || l.includes('گویا')) {
        if (!l.includes('بین') && !l.includes('تا') && !l.includes('بزرگتر') && !l.includes('کوچکتر')) {
            return { type: 'infinite_both', message: '⚠️ مجموعه نامتناهی است' };
        }
    }
    
    // اگر تعداد اعضا زیاد باشد
    if (count > 20) {
        return { type: 'large_finite', message: '⚠️ تعداد اعضای مجموعه زیاد است، همه را نمی‌توان نوشت' };
    }
    
    return { type: 'finite', message: '' };
}

function formatSetWithType(elements, expression) {
    if (!elements || elements.length === 0) return '∅';
    
    const sorted = [...elements].sort((a,b) => a - b);
    const setType = detectSetType(elements, expression);
    const maxDisplay = 10;
    let display = sorted.slice(0, maxDisplay);
    
    if (setType.type === 'infinite_left') {
        return `{ ..., ${display.join(', ')} }`;
    } else if (setType.type === 'infinite_right') {
        return `{ ${display.join(', ')}, ... }`;
    } else if (setType.type === 'infinite_both') {
        return `{ ..., ${display.join(', ')}, ... }`;
    } else if (setType.type === 'large_finite') {
        if (sorted.length > maxDisplay) {
            return `{ ${display.join(', ')}, ... (${sorted.length} عضو) }`;
        }
        return `{ ${sorted.join(', ')} }`;
    } else {
        // finite
        if (sorted.length > maxDisplay) {
            return `{ ${display.join(', ')}, ... (${sorted.length} عضو) }`;
        }
        return `{ ${sorted.join(', ')} }`;
    }
}

function getSetStatusMessage(elements, expression) {
    const setType = detectSetType(elements, expression);
    return setType.message;
}

function getInfinityTypeForDisplay(elements, expression) {
    const setType = detectSetType(elements, expression);
    if (setType.type === 'infinite_left') return 'left';
    if (setType.type === 'infinite_right') return 'right';
    if (setType.type === 'infinite_both') return 'both';
    return 'none';
}

// ===== ادامه کدهای قبلی =====

const SymbolicParser = {
    universalSets: {
        'ℕ': [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
        '𝕎': [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
        'ℤ': [-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10],
        'ℚ': [-2,-1.5,-1,-0.5,0,0.5,1,1.5,2,2.5,3,0.333,0.666,0.25,0.75],
        'ℝ': [-2,-1.5,-1,-0.5,0,0.5,1,1.5,2,2.5,3,Math.PI,Math.E,Math.sqrt(2)],
        'ℚ′': [Math.PI,Math.E,Math.sqrt(2),Math.sqrt(3),Math.sqrt(5),Math.sqrt(7)]
    },
    parse(e) { try { if(!e||e.trim()==='')return[]; const c=this.cleanExpression(e); if(c.includes('{')&&c.includes('}'))return this.parseSetNotation(c); return this.parseSimpleExpression(c); } catch(err) { throw new Error(`خطا: ${err.message}`); } },
    cleanExpression(e) { return e.replace(/\s+/g,' ').replace(/\\/g,'').trim(); },
    parseSetNotation(e) { const c=this.extractSetContent(e); if(!c.includes('|'))return this.parseSimpleSet(c); return this.parseSetBuilderNotation(c); },
    extractSetContent(e) { const s=e.indexOf('{'),ed=e.lastIndexOf('}'); if(s===-1||ed===-1||s>=ed)throw new Error('ساختار آکولاد نامعتبر'); return e.substring(s+1,ed).trim(); },
    parseSimpleSet(c) { const i=c.split(',').map(x=>x.trim()).filter(x=>x!==''); const r=[]; for(const x of i){if(x==='∅')return[]; const n=Number(x); r.push(!isNaN(n)&&x.trim()!==''?n:x);} return this.removeDuplicates(r); },
    parseSetBuilderNotation(c) { const p=c.split('|').map(x=>x.trim()); if(p.length!==2)throw new Error('فرمت نامعتبر'); return this.generateFromConditions(p[1].split(',').map(x=>x.trim()).filter(x=>x)); },
    parseSimpleExpression(e) { 
        const l=e.toLowerCase(); 
        if(l.includes('فرد'))return this.generateOddNumbers(e); 
        if(l.includes('زوج'))return this.generateEvenNumbers(e); 
        if(l.includes('اول'))return this.generatePrimeNumbers(e); 
        if(l.includes('بین')||l.includes('تا'))return this.generateRange(e); 
        if(l.includes('کمتر از') || l.includes('کوچکتر از')) return this.generateLessThan(e); 
        if(l.includes('بزرگتر از') || l.includes('بیشتر از')) return this.generateGreaterThan(e); 
        const n=this.extractAllNumbers(e); 
        if(n.length>0)return n; 
        throw new Error('عبارت قابل تشخیص نیست'); 
    },
    generateLessThan(e) { 
        const n = this.extractAllNumbers(e);
        const sn = this.getBaseSetName(e);
        if(n.length > 0) {
            const limit = n[0];
            if(sn === 'ℕ') {
                const r = [];
                for(let i=1; i<limit; i++) r.push(i);
                return r;
            }
            if(sn === '𝕎') {
                const r = [];
                for(let i=0; i<limit; i++) r.push(i);
                return r;
            }
            if(sn === 'ℤ') {
                const r = [];
                const start = Math.max(-10, -(Math.abs(limit)+5));
                for(let i=start; i<limit; i++) r.push(i);
                return r;
            }
            const r = [];
            for(let i=0; i<limit; i++) r.push(i);
            return r;
        }
        return [0,1,2,3,4];
    },
    generateGreaterThan(e) {
        const n = this.extractAllNumbers(e);
        const sn = this.getBaseSetName(e);
        if(n.length > 0) {
            const limit = n[0];
            const r = [];
            if(sn === 'ℕ') {
                for(let i=limit+1; i<=limit+10; i++) r.push(i);
                return r;
            }
            if(sn === 'ℤ') {
                for(let i=limit+1; i<=limit+10; i++) r.push(i);
                return r;
            }
            for(let i=limit+1; i<=limit+10; i++) r.push(i);
            return r;
        }
        return [1,2,3,4,5];
    },
    getBaseSetName(e) {
        const l = e;
        if(/ℕ|طبیعی/.test(l)) return 'ℕ';
        if(/𝕎|حسابی/.test(l)) return '𝕎';
        if(/ℤ|صحیح/.test(l)) return 'ℤ';
        if(/ℚ|گویا/.test(l)) return 'ℚ';
        if(/ℝ|حقیقی/.test(l)) return 'ℝ';
        if(/ℚ′|گنگ/.test(l)) return 'ℚ′';
        return null;
    },
    generateFromConditions(c) { let b=this.getBaseSet(c); for(const cond of c)b=this.applyCondition(b,cond); return this.removeDuplicates(b); },
    getBaseSet(c) { for(const cond of c){for(const [sn,sv] of Object.entries(this.universalSets)){if(cond.includes(sn))return[...sv];} const ps={'طبیعی':'ℕ','حسابی':'𝕎','صحیح':'ℤ','گویا':'ℚ','حقیقی':'ℝ','گنگ':'ℚ′'}; for(const [pn,sn] of Object.entries(ps)){if(cond.includes(pn))return[...this.universalSets[sn]];}} return Array.from({length:41},(_,i)=>i-20); },
    applyCondition(s,c) { return this.isNumericCondition(c)?this.applyNumericCondition(s,c):this.applySpecialCondition(s,c.toLowerCase()); },
    isNumericCondition(c) { return /[<>≤≥]=?|-?\d/.test(c); },
    applyNumericCondition(s,c) { const n=this.extractAllNumbers(c); if(n.length===0)return s; const cc=c.replace(/\s+/g,''); const rps=[{regex:/(-?\d+\.?\d*)<x<(-?\d+\.?\d*)/,h:m=>({t:'range',l:parseFloat(m[1]),u:parseFloat(m[2]),ls:true,us:true})},{regex:/(-?\d+\.?\d*)<x<=(-?\d+\.?\d*)/,h:m=>({t:'range',l:parseFloat(m[1]),u:parseFloat(m[2]),ls:true,us:false})},{regex:/(-?\d+\.?\d*)<x≤(-?\d+\.?\d*)/,h:m=>({t:'range',l:parseFloat(m[1]),u:parseFloat(m[2]),ls:true,us:false})},{regex:/(-?\d+\.?\d*)<=x<(-?\d+\.?\d*)/,h:m=>({t:'range',l:parseFloat(m[1]),u:parseFloat(m[2]),ls:false,us:true})},{regex:/(-?\d+\.?\d*)≤x<(-?\d+\.?\d*)/,h:m=>({t:'range',l:parseFloat(m[1]),u:parseFloat(m[2]),ls:false,us:true})},{regex:/(-?\d+\.?\d*)<=x<=(-?\d+\.?\d*)/,h:m=>({t:'range',l:parseFloat(m[1]),u:parseFloat(m[2]),ls:false,us:false})},{regex:/(-?\d+\.?\d*)≤x≤(-?\d+\.?\d*)/,h:m=>({t:'range',l:parseFloat(m[1]),u:parseFloat(m[2]),ls:false,us:false})}]; for(const pt of rps){const m=cc.match(pt.regex);if(m){const r=pt.h(m);return s.filter(x=>(r.ls?x>r.l:x>=r.l)&&(r.us?x<r.u:x<=r.u));}} const sps=[{regex:/x>=(-?\d+\.?\d*)/,op:'>='},{regex:/x≥(-?\d+\.?\d*)/,op:'>='},{regex:/x>(-?\d+\.?\d*)/,op:'>'},{regex:/x<=(-?\d+\.?\d*)/,op:'<='},{regex:/x≤(-?\d+\.?\d*)/,op:'<='},{regex:/x<(-?\d+\.?\d*)/,op:'<'}]; for(const pt of sps){const m=cc.match(pt.regex);if(m){const v=parseFloat(m[1]);switch(pt.op){case'>':return s.filter(x=>x>v);case'>=':return s.filter(x=>x>=v);case'<':return s.filter(x=>x<v);case'<=':return s.filter(x=>x<=v);}}} if(n.length>=2){const lo=Math.min(n[0],n[1]),hi=Math.max(n[0],n[1]);return s.filter(x=>x>=lo&&x<=hi);} return s; },
    applySpecialCondition(s,c) { if(c.includes('فرد')||c.includes('odd'))return s.filter(x=>typeof x==='number'&&Math.abs(x%2)===1); if(c.includes('زوج')||c.includes('even'))return s.filter(x=>typeof x==='number'&&x%2===0); if(c.includes('اول')||c.includes('prime'))return s.filter(x=>typeof x==='number'&&this.isPrime(x)); return s; },
    generateOddNumbers(e) { const n=this.extractAllNumbers(e); let s=1,ed=10; if(n.length>=2){s=Math.min(n[0],n[1]);ed=Math.max(n[0],n[1]);}else if(n.length===1)ed=n[0]; const r=[]; for(let i=s;i<=ed;i++){if(Math.abs(i%2)===1)r.push(i);} return r; },
    generateEvenNumbers(e) { const n=this.extractAllNumbers(e); let s=2,ed=10; if(n.length>=2){s=Math.min(n[0],n[1]);ed=Math.max(n[0],n[1]);}else if(n.length===1)ed=n[0]; const r=[]; for(let i=s;i<=ed;i++){if(i%2===0)r.push(i);} return r; },
    generatePrimeNumbers(e) { const n=this.extractAllNumbers(e); const lim=n.length>0?Math.max(...n):20; const st=n.length>1?Math.min(...n):2; const r=[]; for(let i=Math.max(2,st);i<=lim;i++){if(this.isPrime(i))r.push(i);} return r; },
    generateRange(e) { const n=this.extractAllNumbers(e); if(n.length<2)throw new Error('حداقل دو عدد'); const s=Math.min(n[0],n[1]),ed=Math.max(n[0],n[1]),r=[]; for(let i=s;i<=ed;i++)r.push(i); return r; },
    extractAllNumbers(t) { const n=[],m=t.match(/-?\d+(\.\d+)?/g)||[]; for(const x of m){const num=parseFloat(x); if(!isNaN(num))n.push(num);} return n; },
    isPrime(n) { if(n<2||!Number.isInteger(n))return false; if(n===2)return true; if(n%2===0)return false; for(let i=3;i<=Math.sqrt(n);i+=2){if(n%i===0)return false;} return true; },
    removeDuplicates(a) { return [...new Set(a)].sort((a,b)=>typeof a==='number'&&typeof b==='number'?a-b:String(a).localeCompare(String(b))); }
};

function isPrime(n) { if(n<2||!Number.isInteger(n))return false; if(n===2)return true; if(n%2===0)return false; for(let i=3;i<=Math.sqrt(n);i+=2)if(n%i===0)return false; return true; }
function generatePrimeNumbersInRange(s,e) { const p=[]; for(let i=Math.max(2,s);i<=e;i++)if(isPrime(i))p.push(i); return p; }
function generatePrimeNumbers(l) { const p=[]; for(let i=2;i<=l;i++)if(isPrime(i))p.push(i); return p; }
function extractNumbers(t) { const n=[]; const r=/-?\d+(\.\d+)?/g; let m; while((m=r.exec(t))!==null)n.push(parseFloat(m[0])); return n; }
function removeDuplicatesWithWarning(e) { if(!Array.isArray(e))return[]; const seen=new Set(),u=[],d=[]; e.forEach(i=>{let p=i; if(typeof i==='string'&&i.trim()!==''&&!isNaN(Number(i)))p=Number(i); const k=p; if(seen.has(k))d.push(i); else{seen.add(k);u.push(p);}}); if(d.length>0)showMessage(`${d.length} عضو تکراری حذف شد`,'warning',3000); return u.sort((a,b)=>typeof a==='number'&&typeof b==='number'?a-b:String(a).localeCompare(String(b))); }

const SearchManager = { search(q) { if(!q||q.trim()==='')return[]; const r=[],lq=q.toLowerCase().trim(); AppState.sets.forEach((d,n)=>{if(n.toLowerCase().includes(lq))r.push({type:'setName',set:n,data:d,match:`نام مجموعه: ${n}`}); const me=d.elements.filter(e=>e.toString().toLowerCase().includes(lq)); if(me.length>0)r.push({type:'elements',set:n,elements:me,data:d,match:`اعضای ${n}: ${me.join(', ')}`}); if(d.description&&d.description.toLowerCase().includes(lq))r.push({type:'description',set:n,data:d,match:`توصیف ${n}: ${d.description}`});}); return r; } };

const SmartKeyboard = {
    isOpen: false, init() { this.setupEventListeners(); this.makeDraggable(); },
    setupEventListeners() { const kb=document.getElementById('kbBtn'),cb=document.querySelector('.btn-close-kb'); if(kb)kb.addEventListener('click',()=>this.toggle()); if(cb)cb.addEventListener('click',()=>this.hide()); document.querySelectorAll('.btn-keyboard[data-symbol]').forEach(b=>{b.addEventListener('click',e=>{const s=e.currentTarget.getAttribute('data-symbol'); s==='backspace'?this.backspace():this.insertSymbol(s);});}); document.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.isOpen)this.hide();}); },
    toggle() { this.isOpen?this.hide():this.show(); },
    show() { const k=document.getElementById('keyboard'); if(k){k.style.display='flex';setTimeout(()=>{k.classList.add('show');this.isOpen=true;},10);} },
    hide() { const k=document.getElementById('keyboard'); if(k){k.classList.remove('show');setTimeout(()=>{k.style.display='none';this.isOpen=false;},300);} },
    insertSymbol(s) { let a=InputTracker.getActiveInput(); if(!a){const f=document.querySelector('input, textarea');if(f){f.focus();a=f;}else{showMessage('لطفاً یک فیلد ورودی انتخاب کنید','warning');return;}} const st=a.selectionStart,en=a.selectionEnd,v=a.value; a.value=v.substring(0,st)+s+v.substring(en); a.setSelectionRange(st+s.length,st+s.length); a.focus(); a.dispatchEvent(new Event('input',{bubbles:true})); },
    backspace() { let a=InputTracker.getActiveInput(); if(!a)return; const st=a.selectionStart,en=a.selectionEnd,v=a.value; if(st===en&&st>0){a.value=v.substring(0,st-1)+v.substring(en);a.setSelectionRange(st-1,st-1);}else if(st!==en){a.value=v.substring(0,st)+v.substring(en);a.setSelectionRange(st,st);} a.focus(); a.dispatchEvent(new Event('input',{bubbles:true})); },
    makeDraggable() { const keyboard=document.getElementById('keyboard'); const header=keyboard?.querySelector('.keyboard-header'); if(!keyboard||!header)return; let isDragging=false,startX,startY,startLeft,startTop; header.style.cursor='move'; header.addEventListener('mousedown',(e)=>{if(e.target.closest('.btn-close-kb'))return; isDragging=true; startX=e.clientX; startY=e.clientY; const rect=keyboard.getBoundingClientRect(); startLeft=rect.left; startTop=rect.top; keyboard.style.position='fixed'; keyboard.style.bottom='auto'; keyboard.style.top=`${startTop}px`; keyboard.style.left=`${startLeft}px`; keyboard.style.transform='none'; e.preventDefault();}); document.addEventListener('mousemove',(e)=>{if(!isDragging)return; keyboard.style.left=`${startLeft+e.clientX-startX}px`; keyboard.style.top=`${startTop+e.clientY-startY}px`;}); document.addEventListener('mouseup',()=>{isDragging=false;}); header.addEventListener('touchstart',(e)=>{if(e.target.closest('.btn-close-kb'))return; isDragging=true; const touch=e.touches[0]; startX=touch.clientX; startY=touch.clientY; const rect=keyboard.getBoundingClientRect(); startLeft=rect.left; startTop=rect.top; keyboard.style.position='fixed'; keyboard.style.bottom='auto'; keyboard.style.top=`${startTop}px`; keyboard.style.left=`${startLeft}px`; keyboard.style.transform='none'; e.preventDefault();}); document.addEventListener('touchmove',(e)=>{if(!isDragging)return; const touch=e.touches[0]; keyboard.style.left=`${startLeft+touch.clientX-startX}px`; keyboard.style.top=`${startTop+touch.clientY-startY}px`;}); document.addEventListener('touchend',()=>{isDragging=false;}); }
};

const SetOperationsTests = { runAllTests() { try { console.assert(JSON.stringify(union([1,2,3],[3,4,5]))===JSON.stringify([1,2,3,4,5])); console.assert(JSON.stringify(intersection([1,2,3],[2,3,4]))===JSON.stringify([2,3])); console.assert(JSON.stringify(difference([1,2,3,4],[3,4,5]))===JSON.stringify([1,2])); console.assert(JSON.stringify(symmetricDifference([1,2,3],[2,3,4]))===JSON.stringify([1,4])); console.assert(isSubsetOf([1,2],[1,2,3])===true); console.log('✅ All tests passed!'); } catch(e) { console.error('❌ Tests failed:', e); } } };

function union(a,b) { return [...new Set([...a,...b])].sort((x,y)=>typeof x==='number'&&typeof y==='number'?x-y:String(x).localeCompare(String(y))); }
function intersection(a,b) { const s=new Set(b); return a.filter(x=>s.has(x)).sort((x,y)=>typeof x==='number'&&typeof y==='number'?x-y:String(x).localeCompare(String(y))); }
function difference(a,b) { const s=new Set(b); return a.filter(x=>!s.has(x)).sort((x,y)=>typeof x==='number'&&typeof y==='number'?x-y:String(x).localeCompare(String(y))); }
function symmetricDifference(a,b) { return union(difference(a,b),difference(b,a)); }
function isSubsetOf(a,b) { const s=new Set(b); return a.every(x=>s.has(x)); }

function showMessage(m,t='info',d=5000) { const c=document.getElementById('systemMessages'); if(!c)return; const div=document.createElement('div'); div.className=`${t}-message message-fade`; div.textContent=m; c.appendChild(div); setTimeout(()=>{if(div.parentNode){div.style.opacity='0';div.style.transform='translateX(100%)';setTimeout(()=>{if(div.parentNode)div.parentNode.removeChild(div);},300);}},d); }

function formatSet(e) { 
    if(!e || e.length===0) return '∅'; 
    const sorted = [...e].sort((a,b) => a - b);
    if(sorted.length > 50){
        const first = sorted.slice(0, 30); 
        return `{ ${first.join(', ')}, ... (${sorted.length} عضو) }`; 
    } 
    return `{ ${sorted.join(', ')} }`; 
}

function parseSet(i) { if(!i||i.trim()==='')return[]; const e=i.split(',').map(x=>x.trim()).filter(x=>x!==''); return removeDuplicatesWithWarning(e.map(x=>{if(x==='∅')return[]; const n=Number(x); return !isNaN(n)&&x.trim()!==''?n:x;}).flat()); }
function parseSymbolicExpression(e) { return SymbolicParser.parse(e); }

function parseVerbalDescription(d) {
    try {
        if(!d||typeof d!=='string')return { elements: [1,2,3,4,5], infinityType: 'none' };
        const l=d.toLowerCase().trim();
        let r=[];
        let infinityType = 'none';
        let limit = 0;
        
        if(l.includes('کمتر از') || l.includes('کوچکتر از')) {
            const n = extractNumbers(l);
            if(n.length > 0) {
                limit = n[0];
                if(l.includes('صحیح') || l.includes('ℤ')) {
                    infinityType = 'left';
                    const start = Math.max(-10, -(Math.abs(limit)+5));
                    for(let i=start; i<limit; i++) r.push(i);
                    return { elements: r, infinityType: 'left', limit: limit };
                }
                if(l.includes('طبیعی') || l.includes('ℕ')) {
                    infinityType = 'left';
                    for(let i=1; i<limit; i++) r.push(i);
                    return { elements: r, infinityType: 'left', limit: limit };
                }
                if(l.includes('حسابی') || l.includes('𝕎')) {
                    infinityType = 'left';
                    for(let i=0; i<limit; i++) r.push(i);
                    return { elements: r, infinityType: 'left', limit: limit };
                }
            }
        }
        
        if(l.includes('بزرگتر از') || l.includes('بیشتر از')) {
            const n = extractNumbers(l);
            if(n.length > 0) {
                limit = n[0];
                if(l.includes('صحیح') || l.includes('ℤ') || l.includes('طبیعی') || l.includes('ℕ')) {
                    infinityType = 'right';
                    for(let i=limit+1; i<=limit+10; i++) r.push(i);
                    return { elements: r, infinityType: 'right', limit: limit };
                }
            }
        }
        
        if(l.includes('اول')){const n=extractNumbers(l);if(l.includes('بین')&&n.length>=2)return { elements: generatePrimeNumbersInRange(Math.max(2,Math.min(n[0],n[1])),Math.max(n[0],n[1])), infinityType: 'none' };if((l.includes('کوچکتر')||l.includes('کمتر'))&&n.length>0)return { elements: generatePrimeNumbers(Math.max(2,n[0]-1)), infinityType: 'left' };return { elements: generatePrimeNumbers(20), infinityType: 'none' };}
        
        if(l.includes('فرد')){const n=extractNumbers(l);if(l.includes('بین')&&n.length>=2){const s=Math.min(n[0],n[1]),e=Math.max(n[0],n[1]);for(let i=s;i<=e;i++){if(Math.abs(i%2)===1)r.push(i);}return { elements: r, infinityType: 'none' };}if((l.includes('کوچکتر')||l.includes('کمتر'))&&n.length>0){for(let i=1;i<n[0];i+=2)r.push(i);return { elements: r, infinityType: 'left' };}return { elements: [1,3,5,7,9], infinityType: 'none' };}
        
        if(l.includes('زوج')){const n=extractNumbers(l);if(l.includes('بین')&&n.length>=2){const s=Math.min(n[0],n[1]),e=Math.max(n[0],n[1]);for(let i=s;i<=e;i++){if(i%2===0)r.push(i);}return { elements: r, infinityType: 'none' };}if((l.includes('کوچکتر')||l.includes('کمتر'))&&n.length>0){for(let i=2;i<n[0];i+=2)r.push(i);return { elements: r, infinityType: 'left' };}if(l.includes('صحیح') && !l.includes('بین')) {
                for(let i=-10; i<=10; i+=2) r.push(i);
                return { elements: r, infinityType: 'both' };
            }
            return { elements: [2,4,6,8,10], infinityType: 'none' };}
        
        if(l.includes('بین')||l.includes('تا')){const n=extractNumbers(l);if(n.length>=2){let s=Math.min(n[0],n[1]),e=Math.max(n[0],n[1]);if(e-s>5000){showMessage('⚠️ تعداد اعضای مجموعه خیلی زیاد است (>5000). لطفاً بازه کوچک‌تری انتخاب کنید.','warning',6000);e=s+100;}if(l.includes('صحیح')||l.includes('عدد')){for(let i=Math.ceil(s);i<=Math.floor(e);i++)r.push(i);}else if(l.includes('طبیعی')){for(let i=Math.max(1,Math.ceil(s));i<=Math.floor(e);i++)r.push(i);}else if(l.includes('حسابی')){for(let i=Math.max(0,Math.ceil(s));i<=Math.floor(e);i++)r.push(i);}else{for(let i=Math.ceil(s);i<=Math.floor(e);i++)r.push(i);}return { elements: r, infinityType: 'none' };}}
        
        if(l.includes('صحیح') || l.includes('ℤ')) {
            if(!l.includes('بین') && !l.includes('تا') && !l.includes('کمتر') && !l.includes('بزرگتر')) {
                for(let i=-10; i<=10; i++) r.push(i);
                return { elements: r, infinityType: 'both' };
            }
        }
        
        if(l.includes('طبیعی') || l.includes('ℕ')) {
            if(!l.includes('بین') && !l.includes('تا') && !l.includes('کمتر') && !l.includes('بزرگتر')) {
                for(let i=1; i<=10; i++) r.push(i);
                return { elements: r, infinityType: 'left' };
            }
        }
        
        const nums=extractNumbers(l);if(nums.length>0)return { elements: removeDuplicatesWithWarning(nums), infinityType: 'none' };
        return { elements: [1,2,3,4,5], infinityType: 'none' };
    } catch(err) { showMessage(`خطا: ${err.message}`,'error'); return { elements: [1,2,3,4,5], infinityType: 'none' }; }
}

function getTypeName(t) { const m={symbolic:'نمادین',verbal:'کلامی',normal:'عادی',universal:'جهانی',quick:'سریع',operation:'عملیات'}; return m[t]||t; }
function getSetPersianName(n) { const m={'ℕ':'اعداد طبیعی','𝕎':'اعداد حسابی','ℤ':'اعداد صحیح','ℚ':'اعداد گویا','ℝ':'اعداد حقیقی','ℚ′':'اعداد گنگ'}; return m[n]||n; }
function getUniversalSetName(expr) { const m=expr.match(/[ℕ𝕎ℤℚℝℚ′]/); if(m)return m[0]; if(/طبیعی/.test(expr))return'ℕ'; if(/حسابی/.test(expr))return'𝕎'; if(/صحیح/.test(expr))return'ℤ'; if(/گویا/.test(expr))return'ℚ'; if(/حقیقی/.test(expr))return'ℝ'; if(/گنگ/.test(expr))return'ℚ′'; return null; }

function updateStats() { document.getElementById('sets-count').textContent=AppState.sets.size; let t=0; AppState.sets.forEach(d=>{t+=d.elements?d.elements.length:0;}); document.getElementById('elements-count').textContent=t; document.getElementById('active-sets-count').textContent=AppState.sets.size; document.getElementById('total-elements-count').textContent=t; }
function quickCreateSet(n,e) { if(AppState.sets.has(n)){showMessage(`مجموعه "${n}" از قبل وجود دارد`,'warning');return;} const u=removeDuplicatesWithWarning(e); AppState.sets.set(n,{type:'quick',elements:u,infinityType:'none',createdAt:new Date().toISOString()}); HistoryManager.pushState(HistoryManager.getCurrentStateForHistory()); StorageManager.saveState(); updateStats(); showMessage(`✅ مجموعه "${n}" ایجاد شد: ${formatSet(u)}`,'success'); showAllSets(); }

function convertNormalToSymbolic() { const i=document.getElementById('convertInput').value.trim(); if(!i){showMessage('لطفاً اعضا را وارد کنید','error');return;} const e=parseSet(i); if(e.length===0){showMessage('مجموعه خالی است','warning');return;} const ne=e.filter(x=>typeof x==='number'); if(ne.length===0){document.getElementById('convertResult').innerHTML=`<p><strong>مجموعه نمادین:</strong></p><div class="conversion-box">{ ${e.join(', ')} }</div>`;return;} const min=Math.min(...ne),max=Math.max(...ne); let us='ℤ'; if(ne.every(x=>x>=1&&Number.isInteger(x)))us='ℕ'; else if(ne.every(x=>x>=0&&Number.isInteger(x)))us='𝕎'; const ao=ne.every(x=>Math.abs(x%2)===1),ae=ne.every(x=>x%2===0),ap=ne.every(x=>isPrime(x))&&min>=2,fr=ne.length===(max-min+1); let ex=''; if(ao&&fr)ex=`{ x | x ∈ ${us}, ${min} ≤ x ≤ ${max}, x فرد }`; else if(ae&&fr)ex=`{ x | x ∈ ${us}, ${min} ≤ x ≤ ${max}, x زوج }`; else if(ap)ex=`{ x | x ∈ ${us}, x اول, ${min} ≤ x ≤ ${max} }`; else if(fr)ex=`{ x | x ∈ ${us}, ${min} ≤ x ≤ ${max} }`; else ex=`{ ${e.join(', ')} }`; document.getElementById('convertResult').innerHTML=`<p><strong>اصلی:</strong></p><div class="conversion-box">${formatSet(e)}</div><div class="conversion-arrow">⬇️</div><p><strong>نمادین:</strong></p><div class="conversion-box">${ex}</div>`; document.getElementById('convertResult').style.display='block'; }
function convertNormalToVerbal() { const i=document.getElementById('convertInput').value.trim(); if(!i){showMessage('لطفاً اعضا را وارد کنید','error');return;} const e=parseSet(i); if(e.length===0){showMessage('مجموعه خالی است','warning');return;} const ne=e.filter(x=>typeof x==='number'); if(ne.length===0){document.getElementById('convertResult').innerHTML=`<p><strong>کلامی:</strong></p><div class="conversion-box">مجموعه‌ای شامل: ${e.join('، ')}</div>`;document.getElementById('convertResult').style.display='block';return;} const min=Math.min(...ne),max=Math.max(...ne),ao=ne.every(x=>Math.abs(x%2)===1),ae=ne.every(x=>x%2===0),ap=ne.every(x=>isPrime(x))&&min>=2,fr=ne.length===(max-min+1),isInt=ne.every(x=>Number.isInteger(x)); let d=''; if(ao&&isInt)d=`اعداد فرد بین ${min} تا ${max}`; else if(ae&&isInt)d=`اعداد زوج بین ${min} تا ${max}`; else if(ap&&isInt)d=`اعداد اول بین ${min} تا ${max}`; else if(fr&&isInt&&min>=0)d=min>=1?`اعداد طبیعی بین ${min} تا ${max}`:`اعداد حسابی بین ${min} تا ${max}`; else if(fr&&isInt&&min<0)d=`اعداد صحیح بین ${min} تا ${max}`; else d=`مجموعه‌ای شامل ${e.join('، ')}`; document.getElementById('convertResult').innerHTML=`<p><strong>اصلی:</strong></p><div class="conversion-box">${formatSet(e)}</div><div class="conversion-arrow">⬇️</div><p><strong>کلامی:</strong></p><div class="conversion-box">${d}</div>`;document.getElementById('convertResult').style.display='block'; }
function convertVerbalToSymbolic() { const i=document.getElementById('convertInput').value.trim(); if(!i){showMessage('لطفاً توصیف را وارد کنید','error');return;} try{const result=parseVerbalDescription(i); const e=result.elements; const ne=e.filter(x=>typeof x==='number'); if(ne.length===0){document.getElementById('convertResult').innerHTML=`<p><strong>کلامی:</strong></p><div class="conversion-box">${i}</div><div class="conversion-arrow">⬇️</div><p><strong>نمادین:</strong></p><div class="conversion-box">{ ${e.join(', ')} }</div>`;document.getElementById('convertResult').style.display='block';return;} const min=Math.min(...ne),max=Math.max(...ne),l=i.toLowerCase(); let us='ℤ'; if(l.includes('طبیعی'))us='ℕ'; else if(l.includes('حسابی'))us='𝕎'; else if(l.includes('صحیح'))us='ℤ'; let ex=''; if(l.includes('فرد'))ex=`{ x | x ∈ ${us}, ${min} ≤ x ≤ ${max}, x فرد }`; else if(l.includes('زوج'))ex=`{ x | x ∈ ${us}, ${min} ≤ x ≤ ${max}, x زوج }`; else if(l.includes('اول'))ex=`{ x | x ∈ ${us}, x اول, ${min} ≤ x ≤ ${max} }`; else if(result.infinityType === 'left') ex=`{ x | x ∈ ${us}, x < ${result.limit} }`; else if(result.infinityType === 'right') ex=`{ x | x ∈ ${us}, x > ${result.limit} }`; else ex=`{ x | x ∈ ${us}, ${min} ≤ x ≤ ${max} }`; document.getElementById('convertResult').innerHTML=`<p><strong>کلامی:</strong></p><div class="conversion-box">${i}</div><div class="conversion-arrow">⬇️</div><p><strong>نمادین:</strong></p><div class="conversion-box">${ex}</div><p style="margin-top:10px;"><strong>اعضا:</strong> ${formatSet(e)}</p>`;document.getElementById('convertResult').style.display='block';}catch(err){showMessage(`❌ ${err.message}`,'error');} }
function convertSymbolicToVerbal() { const i=document.getElementById('convertInput').value.trim(); if(!i){showMessage('لطفاً عبارت را وارد کنید','error');return;} try{const e=parseSymbolicExpression(i),ne=e.filter(x=>typeof x==='number'); if(ne.length===0){document.getElementById('convertResult').innerHTML=`<p><strong>نمادین:</strong></p><div class="conversion-box">${i}</div><div class="conversion-arrow">⬇️</div><p><strong>کلامی:</strong></p><div class="conversion-box">مجموعه‌ای شامل: ${e.join('، ')}</div>`;document.getElementById('convertResult').style.display='block';return;} const min=Math.min(...ne),max=Math.max(...ne),ao=ne.every(x=>Math.abs(x%2)===1),ae=ne.every(x=>x%2===0),ap=ne.every(x=>isPrime(x))&&min>=2,fr=ne.length===(max-min+1),isInt=ne.every(x=>Number.isInteger(x)),l=i.toLowerCase(); let d=''; if((l.includes('فرد')||ao)&&isInt)d=`اعداد فرد بین ${min} تا ${max}`; else if((l.includes('زوج')||ae)&&isInt)d=`اعداد زوج بین ${min} تا ${max}`; else if((l.includes('اول')||ap)&&isInt)d=`اعداد اول بین ${min} تا ${max}`; else if(fr&&isInt){if(l.includes('ℕ')||min>=1)d=`اعداد طبیعی بین ${min} تا ${max}`; else if(l.includes('𝕎')||min>=0)d=`اعداد حسابی بین ${min} تا ${max}`; else if(l.includes('ℤ')||min<0)d=`اعداد صحیح بین ${min} تا ${max}`; else d=`اعداد بین ${min} تا ${max}`;} else d=`مجموعه‌ای شامل ${ne.join('، ')}`; document.getElementById('convertResult').innerHTML=`<p><strong>نمادین:</strong></p><div class="conversion-box">${i}</div><div class="conversion-arrow">⬇️</div><p><strong>کلامی:</strong></p><div class="conversion-box">${d}</div><p style="margin-top:10px;"><strong>اعضا:</strong> ${formatSet(e)}</p>`;document.getElementById('convertResult').style.display='block';}catch(err){showMessage(`❌ ${err.message}`,'error');} }

function showConversionPage(t) {
    const titles={'normalToSymbolic':'تبدیل عادی به نمادین','normalToVerbal':'تبدیل عادی به کلامی','verbalToSymbolic':'تبدیل کلامی به نمادین','symbolicToVerbal':'تبدیل نمادین به کلامی'};
    const ph={'normalToSymbolic':'1,3,5,7,9','normalToVerbal':'1,3,5,7,9','verbalToSymbolic':'اعداد فرد بین ۱ تا ۱۰','symbolicToVerbal':'{ x | x ∈ ℕ, x ≤ 10 }'};
    document.getElementById("step").innerHTML=`<div class="step-container"><h3>🔄 ${titles[t]}</h3><div class="form-group"><label class="form-label">ورودی:</label><input type="text" id="convertInput" class="form-input" placeholder="${ph[t]}"></div><div class="examples"><strong>📝 نمونه‌ها:</strong><div class="example-buttons"><button onclick="fillConvertExample('1,3,5,7,9')" class="btn-example">1,3,5,7,9</button><button onclick="fillConvertExample('-2,-1,0,1,2')" class="btn-example">-2,-1,0,1,2</button><button onclick="fillConvertExample('اعداد فرد بین ۱ تا ۱۰')" class="btn-example">اعداد فرد ۱ تا ۱۰</button><button onclick="fillConvertExample('{ x | x ∈ ℤ, -4 < x < 5 }')" class="btn-example">{x|x∈ℤ,-4<x<5}</button></div></div><div class="button-group"><button id="convertActionBtn" class="btn btn-success">🔄 تبدیل کن</button><button onclick="addNewSet()" class="btn btn-secondary">🔙 بازگشت</button></div><div id="convertResult" class="conversion-result" style="display:none;"></div></div>`;
    setTimeout(()=>{const btn=document.getElementById('convertActionBtn'); if(btn){if(t==='normalToSymbolic')btn.setAttribute('onclick','convertNormalToSymbolic()');else if(t==='normalToVerbal')btn.setAttribute('onclick','convertNormalToVerbal()');else if(t==='verbalToSymbolic')btn.setAttribute('onclick','convertVerbalToSymbolic()');else if(t==='symbolicToVerbal')btn.setAttribute('onclick','convertSymbolicToVerbal()');}},50);
}
function fillConvertExample(e) { const i=document.getElementById('convertInput'); if(i)i.value=e; }

function showUniversalSetOperations() { document.getElementById("step").innerHTML=`<div class="step-container"><h3>🌍🧮 عملیات روی مجموعه‌های جهانی</h3><p class="infinite-warning">⚠️ توجه: همه مجموعه‌های جهانی نامتناهی هستند.</p><div class="universal-operation-item"><div class="form-group"><label class="form-label">مجموعه اول:</label><select id="universalSetA" class="form-input">${Object.keys(AppState.universalSets).map(n=>`<option value="${n}">${n} - ${getSetPersianName(n)}</option>`).join('')}</select></div><div class="form-group"><label class="form-label">مجموعه دوم:</label><select id="universalSetB" class="form-input">${Object.keys(AppState.universalSets).map(n=>`<option value="${n}">${n} - ${getSetPersianName(n)}</option>`).join('')}</select></div><div class="form-group"><label class="form-label">نوع عملیات:</label><select id="universalOperation" class="form-input"><option value="union">∪ اجتماع</option><option value="intersection">∩ اشتراک</option><option value="difference">− تفاضل</option><option value="symmetricDifference">Δ تفاضل متقارن</option></select></div><div class="button-group"><button onclick="performUniversalSetOperation()" class="btn btn-success">🔍 انجام عملیات</button></div></div><div id="universalOpResult"></div><div class="button-group"><button onclick="showUniversalSets()" class="btn btn-secondary">🔙 بازگشت</button></div></div>`; }
function performUniversalSetOperation() { const a=document.getElementById('universalSetA').value,b=document.getElementById('universalSetB').value,op=document.getElementById('universalOperation').value; const sA=AppState.universalSets[a],sB=AppState.universalSets[b]; if(!sA||!sB){showMessage('مجموعه‌ها معتبر نیستند','error');return;} let r=[],sym='',nm=''; switch(op){case'union':r=union(sA,sB);sym='∪';nm='اجتماع';break;case'intersection':r=intersection(sA,sB);sym='∩';nm='اشتراک';break;case'difference':r=difference(sA,sB);sym='−';nm='تفاضل';break;case'symmetricDifference':r=symmetricDifference(sA,sB);sym='Δ';nm='تفاضل متقارن';break;} document.getElementById('universalOpResult').innerHTML=`<div class="universal-operation-result"><h4>✅ نتیجه ${nm}</h4><p><strong>عملیات:</strong> ${a} ${sym} ${b}</p><p><strong>${a}:</strong> ${formatSet(sA)}</p><p><strong>${b}:</strong> ${formatSet(sB)}</p><p><strong>نتیجه:</strong> ${r.length} عضو</p>${r.length>0?`<div class="set-content">${formatSet(r)}</div>`:'<p style="color:#856404;">⚠️ نتیجه: ∅</p>'}</div>`; }
function checkUniversalMembership() { document.getElementById("step").innerHTML=`<div class="step-container"><h3>🔍 بررسی عضویت در مجموعه‌های جهانی</h3><p class="infinite-warning">⚠️ توجه: همه مجموعه‌های جهانی نامتناهی هستند.</p><div class="form-group"><label class="form-label">عدد:</label><input type="text" id="universalElement" class="form-input" placeholder="مثال: 5"></div><div class="form-group"><label class="form-label">مجموعه:</label><select id="universalTargetSet" class="form-input">${Object.keys(AppState.universalSets).map(n=>`<option value="${n}">${n} - ${getSetPersianName(n)}</option>`).join('')}</select></div><div class="button-group"><button onclick="performUniversalMembership()" class="btn btn-success">🔍 بررسی کن</button><button onclick="showUniversalSets()" class="btn btn-secondary">🔙 بازگشت</button></div><div id="universalMembershipResult"></div></div>`; }
function quickUniversalMembership(e,s) { document.getElementById('universalElement').value=e; document.getElementById('universalTargetSet').value=s; performUniversalMembership(); }
function performUniversalMembership() { const ei=document.getElementById('universalElement').value.trim(),sn=document.getElementById('universalTargetSet').value; if(!ei){showMessage('لطفاً یک عدد وارد کنید','error');return;} const num=Number(ei); if(isNaN(num)){showMessage('لطفاً یک عدد معتبر وارد کنید','error');return;} const isMember=isInUniversalSet(num,sn),sym=isMember?'∈':'∉',pn=getSetPersianName(sn); let reason=''; switch(sn){case'ℕ':reason=Number.isInteger(num)&&num>=1?'✅ عددی صحیح و ≥ ۱ است.':'❌ عدد طبیعی باید صحیح و ≥ ۱ باشد.';break;case'𝕎':reason=Number.isInteger(num)&&num>=0?'✅ عددی صحیح و ≥ ۰ است.':'❌ عدد حسابی باید صحیح و ≥ ۰ باشد.';break;case'ℤ':reason=Number.isInteger(num)?'✅ عددی صحیح است.':'❌ عدد صحیح باید بدون اعشار باشد.';break;case'ℚ':reason=isFinite(num)?'✅ عددی متناهی است.':'❌ عدد گویا باید متناهی باشد.';break;case'ℝ':reason=isFinite(num)?'✅ عددی حقیقی و متناهی است.':'❌ عدد حقیقی باید متناهی باشد.';break;case'ℚ′':reason=!Number.isInteger(num)&&isFinite(num)?'✅ عددی گنگ و حقیقی است.':'❌ عدد گنگ باید غیرصحیح باشد.';break;} document.getElementById('universalMembershipResult').innerHTML=`<div class="universal-operation-result"><h4>${isMember?'✅ عضو مجموعه است':'❌ عضو مجموعه نیست'}</h4><p><strong>عدد:</strong> ${num}</p><p><strong>مجموعه:</strong> ${sn} (${pn})</p><p><strong>نتیجه:</strong> ${num} ${sym} ${sn}</p><p style="margin-top:10px;padding:10px;background:#f8f9fa;border-radius:8px;"><strong>توضیح:</strong> ${reason}</p></div>`; }
function checkUniversalSubset() { document.getElementById("step").innerHTML=`<div class="step-container"><h3>📊 بررسی زیرمجموعه بودن مجموعه‌های جهانی</h3><p class="infinite-warning">⚠️ توجه: رابطه زیرمجموعه‌ای با منطق ریاضی بررسی می‌شود.</p><div class="form-group"><label class="form-label">مجموعه اول:</label><select id="universalSubsetA" class="form-input">${Object.keys(AppState.universalSets).map(n=>`<option value="${n}">${n} - ${getSetPersianName(n)}</option>`).join('')}</select></div><div class="form-group"><label class="form-label">مجموعه دوم:</label><select id="universalSubsetB" class="form-input">${Object.keys(AppState.universalSets).map(n=>`<option value="${n}">${n} - ${getSetPersianName(n)}</option>`).join('')}</select></div><div class="button-group"><button onclick="performUniversalSubset()" class="btn btn-success">🔍 بررسی کن</button><button onclick="showUniversalSets()" class="btn btn-secondary">🔙 بازگشت</button></div><div id="universalSubsetResult"></div></div>`; }
function quickUniversalSubset(a,b) { document.getElementById('universalSubsetA').value=a; document.getElementById('universalSubsetB').value=b; performUniversalSubset(); }
function performUniversalSubset() { const a=document.getElementById('universalSubsetA').value,b=document.getElementById('universalSubsetB').value; const isSub=isSubsetOfUniversal(a,b),pA=getSetPersianName(a),pB=getSetPersianName(b); let rel='',sym='',reason=''; if(a===b){rel='برابر هستند';sym='=';reason=`${a} و ${b} یک مجموعه هستند.`;} else if(isSub){rel='زیرمجموعه است';sym='⊂';reason=getSubsetReason(a,b);} else{rel='زیرمجموعه نیست';sym='⊄';reason=getNotSubsetReason(a,b);} document.getElementById('universalSubsetResult').innerHTML=`<div class="universal-operation-result"><h4>${isSub?'✅ زیرمجموعه است':'❌ زیرمجموعه نیست'}</h4><p><strong>${a} (${pA})</strong></p><p><strong>${b} (${pB})</strong></p><p><strong>رابطه:</strong> ${a} ${sym} ${b}</p><p><strong>توضیح:</strong> ${rel}</p><p style="margin-top:10px;padding:10px;background:#f8f9fa;border-radius:8px;">${reason}</p></div>`; }

function goToMainMenu() { showMainMenu(); }

function showMainMenu() { 
    const se=document.getElementById("step"); 
    if(!se)return; 
    se.innerHTML=`<div class="step-container"><h3>منوی اصلی آزمایشگاه مجموعه‌ها</h3><p>تعداد مجموعه‌های موجود: <strong>${AppState.sets.size}</strong></p><p>لطفاً عملیات مورد نظر را انتخاب کنید:</p><div class="operations-grid"><button onclick="addNewSet()" class="btn-operation">➕ ایجاد مجموعه جدید</button><button onclick="showAllSets()" class="btn-operation">📋 نمایش همه مجموعه‌ها</button><button onclick="showSetOperations()" class="btn-operation">🧮 عملیات روی مجموعه‌ها</button><button onclick="checkMembership()" class="btn-operation">🔍 بررسی عضویت</button><button onclick="checkSubsets()" class="btn-operation">📊 بررسی زیرمجموعه‌ها</button><button onclick="showUniversalSets()" class="btn-operation">🌍 مجموعه‌های جهانی</button><button onclick="showVisualizations()" class="btn-operation">📈 نمایش گرافیکی</button><button onclick="showSearch()" class="btn-operation">🔎 جستجو در مجموعه‌ها</button></div><div class="quick-actions"><button onclick="quickCreateSet('اعداد فرد ۱ تا ۹',[1,3,5,7,9])" class="btn btn-info">اعداد فرد ۱-۹</button><button onclick="quickCreateSet('اعداد زوج ۲ تا ۱۰',[2,4,6,8,10])" class="btn btn-info">اعداد زوج ۲-۱۰</button><button onclick="quickCreateSet('اعداد -۲ تا ۲',[-2,-1,0,1,2])" class="btn btn-info">اعداد -۲ تا ۲</button><button onclick="quickCreateSet('اعداد اول کوچک',[2,3,5,7,11])" class="btn btn-info">اعداد اول کوچک</button></div></div>`; 
}

function showVisualizations() { if(AppState.sets.size===0){showMessage('برای نمایش گرافیکی حداقل به یک مجموعه نیاز دارید','warning');return;} document.getElementById("step").innerHTML=`<div class="step-container"><h3>📊 نمایش گرافیکی مجموعه‌ها</h3><p>تعداد: <strong>${AppState.sets.size}</strong></p><div class="visualization-options"><div class="viz-option" onclick="showVennDiagram()"><div class="viz-icon">🔵</div><div class="viz-title">نمودار ون</div><div class="viz-desc">نمایش روابط بین ۲ یا ۳ مجموعه</div></div><div class="viz-option" onclick="showNumberLine()"><div class="viz-icon">📏</div><div class="viz-title">محور اعداد</div><div class="viz-desc">نمایش مجموعه‌های عددی روی محور</div></div><div class="viz-option" onclick="showCardinalityChart()"><div class="viz-icon">📈</div><div class="viz-title">نمودار اندازه‌ها</div><div class="viz-desc">مقایسه تعداد اعضای مجموعه‌ها</div></div></div><div class="button-group"><button onclick="showMainMenu()" class="btn btn-secondary">🔙 بازگشت به منوی اصلی</button></div></div>`; }

function showVennDiagram() { 
    if(AppState.sets.size<2){
        showMessage('برای نمایش نمودار ون حداقل به ۲ مجموعه نیاز دارید','warning');
        return;
    } 
    const setNames=Array.from(AppState.sets.keys()).slice(0,2);
    const setA=AppState.sets.get(setNames[0]),setB=AppState.sets.get(setNames[1]);
    const onlyA=difference(setA.elements,setB.elements);
    const onlyB=difference(setB.elements,setA.elements);
    const common=intersection(setA.elements,setB.elements);
    
    document.getElementById("step").innerHTML=`
        <div class="step-container">
            <h3>🔵 نمودار ون تعاملی</h3>
            <div class="venn-diagram">
                <div class="venn-container">
                    <div class="venn-wrapper-A">
                        <div class="venn-circle-wrapper">
                            <div class="venn-circle setA"></div>
                        </div>
                        <div class="venn-label-circle" style="margin-top:10px;">${setNames[0]}</div>
                    </div>
                    <div class="venn-wrapper-B">
                        <div class="venn-circle-wrapper">
                            <div class="venn-circle setB"></div>
                        </div>
                        <div class="venn-label-circle" style="margin-top:10px;">${setNames[1]}</div>
                    </div>
                </div>
                <div class="venn-elements">
                    <h4>📊 عناصر مناطق:</h4>
                    <p class="venn-onlyA"><strong>فقط ${setNames[0]}:</strong> ${formatSet(onlyA)}</p>
                    <p class="venn-onlyB"><strong>فقط ${setNames[1]}:</strong> ${formatSet(onlyB)}</p>
                    <p class="venn-common"><strong>${setNames[0]} ∩ ${setNames[1]}:</strong> ${formatSet(common)}</p>
                </div>
                <div style="margin-top:15px; display:flex; gap:20px; justify-content:center; font-size:0.9rem;">
                    <span>🔵 ${setNames[0]}</span>
                    <span>🟢 ${setNames[1]}</span>
                    <span>🟡 اشتراک</span>
                </div>
            </div>
            <div class="button-group">
                <button onclick="showVisualizations()" class="btn btn-secondary">🔙 بازگشت به منوی اصلی</button>
            </div>
        </div>
    `; 
}

function showNumberLine() { if(AppState.sets.size===0){showMessage('ابتدا باید مجموعه‌ای ایجاد کنید','warning');return;} const sn=Array.from(AppState.sets.keys())[0],sd=AppState.sets.get(sn); const nums=sd.elements.filter(x=>typeof x==='number'&&!isNaN(x)); if(nums.length===0){showMessage('این مجموعه شامل اعداد نیست','warning');return;} const min=Math.min(...nums),max=Math.max(...nums),range=(max-min)||1; let marks='',numbers_html='',points=''; const start=Math.floor(min),end=Math.ceil(max); for(let i=start;i<=end;i++){const pos=((i-min)/range)*100;if(pos>=0&&pos<=100){marks+=`<div class="line-mark" style="left:${pos}%;"></div>`;numbers_html+=`<div class="line-number" style="left:${pos}%;">${i}</div>`;}} nums.forEach(x=>{const pos=((x-min)/range)*100;points+=`<div class="set-point" style="left:${pos}%;"></div>`;}); document.getElementById("step").innerHTML=`<div class="step-container"><h3>📏 محور اعداد - مجموعه ${sn}</h3><div class="number-line"><div class="line-container" style="min-width:500px;"><div class="line"></div>${marks}${numbers_html}${points}</div></div><div style="text-align:center;margin:20px 0;"><p><strong>مجموعه:</strong> ${formatSet(nums)}</p><p><strong>دامنه:</strong> از ${min} تا ${max}</p><p><strong>تعداد اعضا:</strong> ${nums.length}</p></div><div class="button-group"><button onclick="showVisualizations()" class="btn btn-secondary">🔙 بازگشت به منوی اصلی</button></div></div>`; }
function showCardinalityChart() { if(AppState.sets.size===0){showMessage('ابتدا باید مجموعه‌ای ایجاد کنید','warning');return;} const swe=Array.from(AppState.sets.entries()).filter(([,d])=>d.elements&&d.elements.length>0); if(swe.length===0){showMessage('هیچ مجموعه‌ای با عضو وجود ندارد','warning');return;} const mc=Math.max(...swe.map(([,d])=>d.elements.length)); let bars=''; swe.forEach(([n,d])=>{const h=mc>0?(d.elements.length/mc)*100:0;bars+=`<div class="chart-bar" style="height:${h}%;"><div class="chart-value">${d.elements.length}</div><div class="chart-label">${n.length>8?n.substring(0,6)+'..':n}</div></div>`;}); document.getElementById("step").innerHTML=`<div class="step-container"><h3>📈 نمودار اندازه مجموعه‌ها</h3><div class="cardinality-chart"><div class="chart-container">${bars}</div></div><p style="text-align:center;">تعداد اعضای هر مجموعه به صورت بصری نمایش داده شده است.</p><p style="text-align:center;margin-top:10px;"><strong>بیشترین تعداد:</strong> ${mc} عضو</p><div class="button-group"><button onclick="showVisualizations()" class="btn btn-secondary">🔙 بازگشت به منوی اصلی</button></div></div>`; }

function showAllSets() { 
    if(AppState.sets.size===0){
        document.getElementById("step").innerHTML=`<div class="step-container"><h3>مجموعه‌های موجود</h3><p>هنوز هیچ مجموعه‌ای ایجاد نشده است.</p><div class="quick-actions"><button onclick="quickCreateSet('اعداد فرد ۱ تا ۹',[1,3,5,7,9])" class="btn btn-info">اعداد فرد ۱-۹</button><button onclick="quickCreateSet('اعداد زوج ۲ تا ۱۰',[2,4,6,8,10])" class="btn btn-info">اعداد زوج ۲-۱۰</button><button onclick="quickCreateSet('اعداد -۲ تا ۲',[-2,-1,0,1,2])" class="btn btn-info">اعداد -۲ تا ۲</button></div><div class="button-group"><button onclick="addNewSet()" class="btn btn-primary">➕ ایجاد مجموعه جدید</button><button onclick="showMainMenu()" class="btn btn-secondary">🔙 بازگشت به منوی اصلی</button></div></div>`;
        return;
    } 
    let h='<div class="step-container"><h3>مجموعه‌های موجود</h3>'; 
    h+=`<p>تعداد مجموعه‌ها: <strong>${AppState.sets.size}</strong></p>`; 
    AppState.sets.forEach((d,n)=>{
        const e=d.elements||[]; 
        let c=''; 
        let infType = d.infinityType || 'none';
        let statusMsg = d.statusMessage || '';
        
        if(d.type==='symbolic'){
            const dis = (infType !== 'none') ? 
                formatInfiniteSet(e, infType) + '<br><small style="color:#856404;">' + (statusMsg || '⚠️ مجموعه نامتناهی است') + '</small>' : 
                formatSetWithType(e, d.expression);
            c=`<div class="set-expression">${d.expression}</div><div class="set-content">مقادیر: ${dis}</div>`;
        } else if(d.type==='verbal'){
            const dis = (infType !== 'none') ? 
                formatInfiniteSet(e, infType) + '<br><small style="color:#856404;">' + (statusMsg || '⚠️ مجموعه نامتناهی است') + '</small>' : 
                formatSet(e);
            c=`<div class="set-description">${d.description}</div><div class="set-content">${dis}</div>`;
        } else {
            c=`<div class="set-content">${formatSet(e)}</div>`;
        }
        h+=`<div class="set-item"><div class="set-name">${n} <small>(${getTypeName(d.type)})</small></div>${c}<div class="set-actions"><button onclick="editSet('${n}')" class="btn btn-info">✏️ ویرایش</button><button onclick="deleteSet('${n}')" class="btn btn-danger">🗑️ حذف</button><button onclick="showSetDetails('${n}')" class="btn btn-secondary">📊 جزئیات</button></div></div>`;
    }); 
    h+='<div class="button-group"><button onclick="addNewSet()" class="btn btn-success">➕ مجموعه جدید</button><button onclick="showMainMenu()" class="btn btn-primary">🏠 منوی اصلی</button></div></div>'; 
    document.getElementById("step").innerHTML=h; 
}

function addNewSet() { document.getElementById("step").innerHTML=`<div class="step-container"><h3>ایجاد مجموعه جدید</h3><p>تعداد مجموعه‌های موجود: <strong>${AppState.sets.size}</strong></p><div class="keyboard-hint" style="background: linear-gradient(135deg, #4c8bff, #667eea); color: white; padding: 15px 20px; border-radius: 12px; margin: 15px 0; display: flex; align-items: center; gap: 12px; font-weight: 600; border-right: 4px solid #2a5fc4;"><span style="font-size: 1.8rem;">⌨️</span><span>برای وارد کردن مجموعه‌های خود از کیبورد هوشمند استفاده کنید. برای باز کردن کیبورد، روی دکمه ⌨️ در پایین صفحه سمت چپ کلیک کنید.</span></div><p>لطفاً نوع ورودی مجموعه را انتخاب کنید:</p><div class="input-type-selector"><button onclick="showSymbolicInput()" class="btn-type"><strong>روش نمادین</strong><br><small>مثال: { x | x ∈ ℕ , 3 ≤ x ≤ 8 }</small></button><button onclick="showVerbalInput()" class="btn-type"><strong>حالت کلامی</strong><br><small>مثال: اعداد فرد بین ۱ تا ۱۰</small></button><button onclick="showNormalInput()" class="btn-type"><strong>حالت مستقیم</strong><br><small>مثال: 1,2,3,4,5</small></button></div><h4 style="margin-top:30px;color:#6f42c1;">🔄 تبدیل فرمت‌ها:</h4><div class="input-type-selector"><button onclick="showConversionPage('normalToSymbolic')" class="btn-convert"><strong>عادی → نمادین</strong></button><button onclick="showConversionPage('normalToVerbal')" class="btn-convert"><strong>عادی → کلامی</strong></button><button onclick="showConversionPage('verbalToSymbolic')" class="btn-convert"><strong>کلامی → نمادین</strong></button><button onclick="showConversionPage('symbolicToVerbal')" class="btn-convert"><strong>نمادین → کلامی</strong></button></div><div class="button-group"><button onclick="showMainMenu()" class="btn btn-secondary">🔙 بازگشت به منوی اصلی</button></div></div>`; }

function showSymbolicInput() { document.getElementById("step").innerHTML=`<div class="step-container"><h3>ایجاد مجموعه با روش نمادین</h3><p>عبارت نمادین مجموعه را وارد کنید:</p><div class="form-group"><label class="form-label">نام مجموعه:</label><input type="text" id="setName" class="form-input" placeholder="مثال: مجموعه A"></div><div class="form-group"><label class="form-label">عبارت نمادین:</label><input type="text" id="symbolicExpression" class="form-input" style="direction: ltr; text-align: left; font-family: 'Courier New', monospace;" placeholder="مثال: { x | x ∈ ℤ , 2 < x < 20 } یا {1,2,3,4,5}"><small style="color:#666;display:block;margin-top:5px;">💡 از کیبورد ریاضی (⌨️) برای تایپ نمادها استفاده کنید</small></div><div class="examples"><strong>📝 نمونه‌های آماده (کلیک کنید):</strong><div class="example-buttons"><button onclick="fillSymbolicExample('{ x | x ∈ ℤ , 2 < x < 20 }')" class="btn-example">{ x | x ∈ ℤ , 2 < x < 20 }</button><button onclick="fillSymbolicExample('{1,2,3,4,5}')" class="btn-example">{1,2,3,4,5}</button><button onclick="fillSymbolicExample('{ x | x ∈ ℕ , x ≤ 10 }')" class="btn-example">{ x | x ∈ ℕ , x ≤ 10 }</button></div></div><div class="quick-actions"><button onclick="testSymbolicParser()" class="btn btn-warning">🧪 تست تجزیه‌کننده</button><button onclick="showLivePreview()" class="btn btn-info">👁️ پیش‌نمایش زنده</button></div><div id="previewContainer" style="display:none;"><div class="set-details"><h4>👁️ پیش‌نمایش:</h4><div id="livePreview"></div></div></div><div class="button-group"><button onclick="createSymbolicSet()" class="btn btn-success">✅ ایجاد مجموعه</button><button onclick="addNewSet()" class="btn btn-secondary">🔙 بازگشت به منوی اصلی</button></div></div>`; const ei=document.getElementById('symbolicExpression');ei.addEventListener('input',debounce(showLivePreview,500)); }

function showLivePreview() { 
    const e = document.getElementById('symbolicExpression').value.trim();
    const pc = document.getElementById('previewContainer');
    const lp = document.getElementById('livePreview'); 
    if(!e){pc.style.display='none';return;} 
    try{
        const el = parseSymbolicExpression(e);
        const infType = getInfinityTypeForDisplay(el, e);
        const statusMsg = getSetStatusMessage(el, e);
        
        let displayHtml = '';
        if (infType !== 'none') {
            displayHtml = formatInfiniteSet(el, infType);
        } else {
            displayHtml = formatSetWithType(el, e);
        }
        
        let statusHtml = '';
        if (statusMsg) {
            statusHtml = `<p style="color:#856404;background:#fff3cd;padding:10px;border-radius:8px;margin-top:10px;"><strong>${statusMsg}</strong></p>`;
        }
        
        lp.innerHTML = `
            <p><strong>عناصر:</strong> ${displayHtml}</p>
            <p><strong>تعداد:</strong> ${el.length}</p>
            ${statusHtml}
        `;
        pc.style.display='block';
    } catch(err) {
        lp.innerHTML = `<p style="color:var(--danger-color);">${err.message}</p>`;
        pc.style.display='block';
    } 
}

function debounce(f,w){let t;return function(...a){clearTimeout(t);t=setTimeout(()=>f(...a),w);};}
function testSymbolicParser(){const e=document.getElementById('symbolicExpression').value.trim();if(!e){showMessage('عبارت را وارد کنید','warning');return;}try{const el=parseSymbolicExpression(e);const infType=getInfinityTypeForDisplay(el,e);const statusMsg=getSetStatusMessage(el,e); if(infType!=='none'){ showMessage(`⚠️ مجموعه نامتناهی - نمونه: ${formatInfiniteSet(el, infType)} ${statusMsg}`,'warning',6000);}else{showMessage(`✅ ${formatSetWithType(el, e)} ${statusMsg}`,'success',5000);}}catch(err){showMessage(`❌ ${err.message}`,'error',5000);}}

function createSymbolicSet(){
    const n = document.getElementById('setName').value.trim();
    const e = document.getElementById('symbolicExpression').value.trim();
    if(!n||!e){showMessage('فیلدها را پر کنید','error');return;}
    if(AppState.sets.has(n)){showMessage(`"${n}" تکراری`,'warning');return;}
    try{
        let el = parseSymbolicExpression(e);
        const infType = getInfinityTypeForDisplay(el, e);
        const statusMsg = getSetStatusMessage(el, e);
        const isInf = infType !== 'none';
        
        AppState.sets.set(n, {
            type: 'symbolic',
            elements: el,
            expression: e,
            isInfinite: isInf,
            infinityType: infType,
            statusMessage: statusMsg,
            createdAt: new Date().toISOString()
        });
        HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());
        StorageManager.saveState();
        updateStats();
        
        let displayMsg = `✅ "${n}" ایجاد شد: `;
        if (isInf) {
            displayMsg += formatInfiniteSet(el, infType);
        } else {
            displayMsg += formatSetWithType(el, e);
        }
        if (statusMsg) {
            displayMsg += `\n${statusMsg}`;
        }
        showMessage(displayMsg, isInf ? 'warning' : 'success', 6000);
        showAllSets();
    } catch(err){showMessage(`❌ ${err.message}`,'error');}
}

function showVerbalInput(){document.getElementById("step").innerHTML=`<div class="step-container"><h3>ایجاد مجموعه با توصیف کلامی</h3><p>توصیف مجموعه را به زبان فارسی وارد کنید:</p><div class="form-group"><label class="form-label">نام:</label><input type="text" id="setName" class="form-input" placeholder="اعداد فرد"></div><div class="form-group"><label class="form-label">توصیف:</label><input type="text" id="verbalDescription" class="form-input" placeholder="اعداد فرد بین ۱ تا ۱۰"></div><div class="examples"><strong>📝 نمونه‌ها:</strong><div class="example-buttons"><button onclick="fillVerbalExample('اعداد فرد بین ۱ تا ۹')" class="btn-example">اعداد فرد ۱ تا ۹</button><button onclick="fillVerbalExample('اعداد زوج بین ۲ تا ۱۰')" class="btn-example">اعداد زوج ۲ تا ۱۰</button><button onclick="fillVerbalExample('اعداد اول کوچکتر از ۱۵')" class="btn-example">اعداد اول < ۱۵</button><button onclick="fillVerbalExample('اعداد طبیعی کمتر از ۶')" class="btn-example">اعداد طبیعی کمتر از ۶</button><button onclick="fillVerbalExample('اعداد صحیح کمتر از ۴')" class="btn-example">اعداد صحیح کمتر از ۴</button><button onclick="fillVerbalExample('اعداد صحیح بزرگتر از -۳')" class="btn-example">اعداد صحیح بزرگتر از -۳</button><button onclick="fillVerbalExample('اعداد صحیح زوج')" class="btn-example">اعداد صحیح زوج</button></div></div><div class="button-group"><button onclick="createVerbalSet()" class="btn btn-success">✅ ایجاد</button><button onclick="addNewSet()" class="btn btn-secondary">🔙 بازگشت به منوی اصلی</button></div></div>`;}
function createVerbalSet(){const n=document.getElementById('setName').value.trim(),d=document.getElementById('verbalDescription').value.trim();if(!n||!d){showMessage('فیلدها را پر کنید','error');return;}if(AppState.sets.has(n)){showMessage(`"${n}" تکراری`,'warning');return;}try{const result=parseVerbalDescription(d); const el=result.elements; const infType=result.infinityType || 'none'; AppState.sets.set(n,{type:'verbal',elements:el,description:d,infinityType:infType,createdAt:new Date().toISOString()});HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());StorageManager.saveState();updateStats(); let displayMsg = `✅ "${n}" ایجاد شد: `; if(infType !== 'none'){ displayMsg += formatInfiniteSet(el, infType); } else { displayMsg += formatSet(el); } showMessage(displayMsg,'success');showAllSets();}catch(err){showMessage(`❌ ${err.message}`,'error');}}

function showNormalInput(){document.getElementById("step").innerHTML=`<div class="step-container"><h3>ایجاد مجموعه با مقادیر مستقیم</h3><p>اعضای مجموعه را وارد کنید:</p><div class="form-group"><label class="form-label">نام:</label><input type="text" id="setName" class="form-input" placeholder="مجموعه نمونه"></div><div class="form-group"><label class="form-label">اعضا:</label><input type="text" id="setElements" class="form-input" placeholder="1,2,3,4,5"></div><div class="examples"><strong>📝 نمونه‌ها:</strong><div class="example-buttons"><button onclick="fillNormalExample('1,2,3,4,5')" class="btn-example">1,2,3,4,5</button><button onclick="fillNormalExample('-2,-1,0,1,2')" class="btn-example">-2,-1,0,1,2</button></div></div><div class="button-group"><button onclick="createNormalSet()" class="btn btn-success">✅ ایجاد</button><button onclick="addNewSet()" class="btn btn-secondary">🔙 بازگشت به منوی اصلی</button></div></div>`;}
function createNormalSet(){const n=document.getElementById('setName').value.trim(),e=document.getElementById('setElements').value.trim();if(!n||!e){showMessage('فیلدها را پر کنید','error');return;}if(AppState.sets.has(n)){showMessage(`"${n}" تکراری`,'warning');return;}const el=parseSet(e);AppState.sets.set(n,{type:'normal',elements:el,infinityType:'none',createdAt:new Date().toISOString()});HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());StorageManager.saveState();updateStats();showMessage(`✅ "${n}" ایجاد شد`,'success');showAllSets();}

function fillSymbolicExample(e){document.getElementById('symbolicExpression').value=e;showLivePreview();}
function fillVerbalExample(e){document.getElementById('verbalDescription').value=e;}
function fillNormalExample(e){document.getElementById('setElements').value=e;}

function editSet(n){const d=AppState.sets.get(n);if(!d)return;document.getElementById("step").innerHTML=`<div class="step-container"><h3>✏️ ویرایش ${n}</h3><div class="form-group"><label class="form-label">نام جدید:</label><input type="text" id="newSetName" class="form-input" value="${n}"></div><div class="form-group"><label class="form-label">اعضا:</label><input type="text" id="newSetElements" class="form-input" value="${d.elements.join(', ')}"></div><div class="button-group"><button onclick="updateSet('${n}')" class="btn btn-success">💾 ذخیره</button><button onclick="showAllSets()" class="btn btn-secondary">🔙</button></div></div>`;}
function updateSet(o){const nn=document.getElementById('newSetName').value.trim(),ei=document.getElementById('newSetElements').value.trim();if(!nn||!ei){showMessage('فیلدها را پر کنید','error');return;}const e=parseSet(ei);if(nn!==o)AppState.sets.delete(o);AppState.sets.set(nn,{type:'normal',elements:e,infinityType:'none',createdAt:new Date().toISOString()});HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());StorageManager.saveState();updateStats();showMessage(`✅ "${nn}" به‌روزرسانی شد`,'success');showAllSets();}
function deleteSet(n){if(confirm(`حذف "${n}"؟`)){AppState.sets.delete(n);HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());StorageManager.saveState();updateStats();showMessage(`✅ "${n}" حذف شد`,'success');showAllSets();}}
function showSetDetails(n){
    const d=AppState.sets.get(n);
    if(!d)return;
    let iw='';
    if(AppState.infiniteSetsInfo && AppState.infiniteSetsInfo[n]) {
        iw=`<p style="color:#856404;background:#fff3cd;padding:10px;border-radius:8px;margin:12px 0;">${AppState.infiniteSetsInfo[n]}</p>`;
    }
    
    let infType = d.infinityType || 'none';
    let statusMsg = d.statusMessage || '';
    let elDisplay = '';
    
    if (infType !== 'none') {
        elDisplay = formatInfiniteSet(d.elements, infType) + 
                    '<br><small style="color:#856404;">' + (statusMsg || '⚠️ مجموعه نامتناهی است') + '</small>';
    } else {
        elDisplay = formatSet(d.elements);
        if (statusMsg) {
            elDisplay += '<br><small style="color:#856404;">' + statusMsg + '</small>';
        }
    }
    
    document.getElementById("step").innerHTML=`<div class="step-container"><h3>📊 ${n}</h3><div class="set-details"><p><strong>نوع:</strong> ${getTypeName(d.type)}</p><p><strong>تعداد:</strong> ${d.elements.length}</p><p><strong>اعضا:</strong> ${elDisplay}</p>${d.expression?`<p><strong>نمادین:</strong> ${d.expression}</p>`:''}${d.description?`<p><strong>توصیف:</strong> ${d.description}</p>`:''}${d.operation?`<p><strong>عملیات:</strong> ${d.operation}</p>`:''}${iw}<p><strong>زمان:</strong> ${new Date(d.createdAt).toLocaleString('fa-IR')}</p></div><button onclick="showAllSets()" class="btn btn-secondary">🔙</button></div>`;
}

function undoLastAction(){if(HistoryManager.undo()){updateStats();showMessage('عملیات قبلی بازگردانی شد','success');}else showMessage('هیچ عملیاتی برای بازگشت وجود ندارد','warning');}
function clearAllSets(){if(AppState.sets.size===0){showMessage('هیچ مجموعه‌ای نیست','warning');return;}if(confirm(`پاک کردن تمام ${AppState.sets.size} مجموعه؟`)){AppState.sets.clear();AppState.nextSetId=1;HistoryManager.clearHistory();StorageManager.saveState();updateStats();showMessage('✅ تمام مجموعه‌ها پاک شدند','success');showMainMenu();}}
function startNew(){AppState.sets.clear();AppState.nextSetId=1;HistoryManager.clearHistory();StorageManager.saveState();updateStats();showMessage('🔄 برنامه از نو شروع شد','info');showMainMenu();}
function debugAppState(){console.log('🐛',{sets:Array.from(AppState.sets.entries()),history:HistoryManager.history});showMessage('دیباگ در کنسول','info',3000);}

function showHelp(){
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>📚 راهنمای کامل برنامه</h3>
            <div class="help-content">
                <div class="help-section"><h4>🎯 نحوه استفاده:</h4><ul><li>برای ایجاد مجموعه جدید از منوی اصلی استفاده کنید</li><li>سه روش برای ایجاد مجموعه دارید: نمادین، کلامی و مستقیم</li><li>از دکمه‌های سریع برای ایجاد مجموعه‌های نمونه استفاده کنید</li><li>برای عملیات روی مجموعه‌ها حداقل به ۲ مجموعه نیاز دارید</li></ul></div>
                <div class="help-section"><h4>🔄 تبدیل فرمت‌ها:</h4><ul><li><strong>عادی → نمادین:</strong> تبدیل لیست اعداد به فرمت {x | x ∈ ...}</li><li><strong>عادی → کلامی:</strong> تبدیل لیست اعداد به توصیف فارسی</li><li><strong>کلامی → نمادین:</strong> تبدیل توصیف فارسی به فرمت نمادین</li><li><strong>نمادین → کلامی:</strong> تبدیل فرمت نمادین به توصیف فارسی</li></ul></div>
                <div class="help-section"><h4>🔧 عملیات موجود:</h4><ul><li><strong>اتحاد (A ∪ B):</strong> همه عناصر دو مجموعه</li><li><strong>اشتراک (A ∩ B):</strong> عناصر مشترک دو مجموعه</li><li><strong>تفاضل (A - B):</strong> عناصر A که در B نیستند</li><li><strong>تفاضل متقارن (A Δ B):</strong> عناصری که فقط در یکی از مجموعه‌ها هستند</li><li><strong>بررسی عضویت:</strong> آیا عنصر در مجموعه است؟</li><li><strong>بررسی زیرمجموعه:</strong> آیا مجموعه A زیرمجموعه B است؟</li></ul></div>
                <div class="help-section"><h4>📊 نمایش‌های گرافیکی:</h4><ul><li><strong>نمودار ون:</strong> نمایش روابط بین ۲ یا ۳ مجموعه</li><li><strong>محور اعداد:</strong> نمایش مجموعه‌های عددی روی محور</li><li><strong>نمودار اندازه‌ها:</strong> مقایسه تعداد اعضای مجموعه‌ها</li></ul></div>
                <div class="help-section"><h4>🎪 فرمت‌های ورودی پشتیبانی شده:</h4><ul><li><strong>نمادین:</strong> {x | x ∈ ℕ, x ≤ 5} یا {1,2,3,4,5}</li><li><strong>کلامی:</strong> اعداد فرد بین ۱ تا ۱۰ یا اعداد اول کوچکتر از ۱۵</li><li><strong>مستقیم:</strong> 1,2,3,4,5 یا a,b,c,d,e</li></ul></div>
            </div>
            <div class="button-group" style="margin-top:25px;"><button onclick="showMainMenu()" class="btn btn-primary">🔙 بازگشت به منوی اصلی</button></div>
        </div>`;
}

function showSetOperations(){if(AppState.sets.size<2){showMessage('حداقل ۲ مجموعه نیاز است','warning');return;}document.getElementById("step").innerHTML=`<div class="step-container"><h3>🧮 عملیات روی مجموعه‌ها</h3><p>تعداد: <strong>${AppState.sets.size}</strong></p><div class="operations-grid"><button onclick="showBinaryOperation('union')" class="btn-operation">∪<br>اجتماع مجموعه‌ها</button><button onclick="showBinaryOperation('intersection')" class="btn-operation">∩<br>اشتراک مجموعه‌ها</button><button onclick="showBinaryOperation('difference')" class="btn-operation">−<br>تفاضل مجموعه‌ها</button><button onclick="showBinaryOperation('symmetricDifference')" class="btn-operation">Δ<br>تفاضل متقارن</button></div><div class="button-group"><button onclick="showMainMenu()" class="btn btn-primary">🏠 منوی اصلی</button></div></div>`;}
function showBinaryOperation(op){const ns=Array.from(AppState.sets.keys()),nm={union:'اجتماع',intersection:'اشتراک',difference:'تفاضل',symmetricDifference:'تفاضل متقارن'};let sym='';switch(op){case'union':sym='∪';break;case'intersection':sym='∩';break;case'difference':sym='−';break;case'symmetricDifference':sym='Δ';break;}document.getElementById("step").innerHTML=`<div class="step-container"><h3>${sym} ${nm[op]} مجموعه‌ها</h3><div class="form-group"><label class="form-label">اول:</label><select id="setA" class="form-input">${ns.map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div><div class="form-group"><label class="form-label">دوم:</label><select id="setB" class="form-input">${ns.map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div><div class="form-group"><label class="form-label">نام نتیجه:</label><input type="text" id="resultName" class="form-input" placeholder="نتیجه اجتماع"></div><div class="button-group"><button onclick="performBinaryOperation('${op}')" class="btn btn-success">🔍 انجام</button><button onclick="showSetOperations()" class="btn btn-secondary">🔙 بازگشت به عملیات</button></div></div>`;}
function performBinaryOperation(op){const a=document.getElementById('setA').value,b=document.getElementById('setB').value,rn=document.getElementById('resultName').value.trim()||'نتیجه';const sA=AppState.sets.get(a),sB=AppState.sets.get(b);if(!sA||!sB){showMessage('مجموعه‌ها نامعتبر','error');return;}let r=[],sym='',nm='';switch(op){case'union':r=union(sA.elements,sB.elements);sym='∪';nm='اجتماع';break;case'intersection':r=intersection(sA.elements,sB.elements);sym='∩';nm='اشتراک';break;case'difference':r=difference(sA.elements,sB.elements);sym='−';nm='تفاضل';break;case'symmetricDifference':r=symmetricDifference(sA.elements,sB.elements);sym='Δ';nm='تفاضل متقارن';break;}AppState.sets.set(rn,{type:'operation',elements:r,operation:`${a} ${sym} ${b}`,infinityType:'none',createdAt:new Date().toISOString()});HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());StorageManager.saveState();updateStats();document.getElementById("step").innerHTML=`<div class="step-container"><h3>✅ ${nm}</h3><div class="set-details"><p><strong>${a}:</strong> ${formatSet(sA.elements)}</p><p><strong>${b}:</strong> ${formatSet(sB.elements)}</p><p><strong>نتیجه:</strong> ${formatSet(r)}</p></div><button onclick="showAllSets()" class="btn btn-success">📋 مشاهده</button><button onclick="showSetOperations()" class="btn btn-info">🧮 بیشتر</button><button onclick="showMainMenu()" class="btn btn-primary">🏠 منوی اصلی</button></div>`;}

function checkMembership(){const ns=Array.from(AppState.sets.keys());if(ns.length===0){showMessage('مجموعه‌ای نیست','warning');return;}document.getElementById("step").innerHTML=`<div class="step-container"><h3>🔍 بررسی عضویت</h3><div class="form-group"><label class="form-label">عنصر:</label><input type="text" id="element" class="form-input" placeholder="5"></div><div class="form-group"><label class="form-label">مجموعه:</label><select id="targetSet" class="form-input">${ns.map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div><div class="button-group"><button onclick="checkElementMembership()" class="btn btn-success">🔍 بررسی</button><button onclick="showMainMenu()" class="btn btn-primary">🏠 منوی اصلی</button></div></div>`;}
function checkElementMembership(){const ei=document.getElementById('element').value.trim(),tn=document.getElementById('targetSet').value,ts=AppState.sets.get(tn);if(!ei||!ts){showMessage('نامعتبر','error');return;}let e=ei;const n=Number(ei);if(!isNaN(n)&&ei.trim()!=='')e=n;const im=ts.elements.includes(e),sym=im?'∈':'∉';document.getElementById("step").innerHTML=`<div class="step-container"><h3>${im?'✅ عضو است':'❌ نیست'}</h3><div class="set-details"><p><strong>عنصر:</strong> ${e}</p><p><strong>مجموعه:</strong> ${tn} = ${formatSet(ts.elements)}</p><p><strong>نتیجه:</strong> ${e} ${sym} ${tn}</p></div><button onclick="checkMembership()" class="btn btn-info">🔍 دوباره</button><button onclick="showMainMenu()" class="btn btn-primary">🏠 منوی اصلی</button></div>`;}

function checkSubsets(){const ns=Array.from(AppState.sets.keys());if(ns.length<2){showMessage('۲ مجموعه نیاز است','warning');return;}document.getElementById("step").innerHTML=`<div class="step-container"><h3>📊 زیرمجموعه</h3><div class="form-group"><label class="form-label">اول:</label><select id="subsetCandidate" class="form-input">${ns.map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div><div class="form-group"><label class="form-label">دوم:</label><select id="supersetCandidate" class="form-input">${ns.map(x=>`<option value="${x}">${x}</option>`).join('')}</select></div><div class="button-group"><button onclick="checkSubsetRelation()" class="btn btn-success">🔍 بررسی</button><button onclick="showMainMenu()" class="btn btn-primary">🏠 منوی اصلی</button></div></div>`;}
function checkSubsetRelation(){const a=document.getElementById('subsetCandidate').value,b=document.getElementById('supersetCandidate').value,sA=AppState.sets.get(a),sB=AppState.sets.get(b);if(!sA||!sB){showMessage('نامعتبر','error');return;}const isSub=isSubsetOf(sA.elements,sB.elements),isProp=isSub&&sA.elements.length<sB.elements.length,isEq=JSON.stringify(sA.elements)===JSON.stringify(sB.elements);let rel='',sym='';if(isEq){rel='برابر';sym='=';}else if(isProp){rel='زیرمجموعه سره';sym='⊂';}else if(isSub){rel='زیرمجموعه';sym='⊆';}else{rel='نیست';sym='⊈';}document.getElementById("step").innerHTML=`<div class="step-container"><h3>${isSub?'✅ زیرمجموعه':'❌ نیست'}</h3><div class="set-details"><p><strong>${a}:</strong> ${formatSet(sA.elements)}</p><p><strong>${b}:</strong> ${formatSet(sB.elements)}</p><p><strong>رابطه:</strong> ${a} ${sym} ${b}</p><p><strong>توضیح:</strong> ${rel}</p></div><button onclick="checkSubsets()" class="btn btn-info">🔍 دوباره</button><button onclick="showMainMenu()" class="btn btn-primary">🏠 منوی اصلی</button></div>`;}

function showUniversalSets(){document.getElementById("step").innerHTML=`<div class="step-container"><h3>🌍 مجموعه‌های جهانی</h3><p>مجموعه‌های استاندارد ریاضی:</p><div class="sets-list">${Object.entries(AppState.universalSets).map(([n,e])=>`<div class="set-item"><div class="set-name">${n} <small>(${getSetPersianName(n)})</small></div><div class="set-content">${formatSet(e)}</div><div class="infinite-warning">${AppState.infiniteSetsInfo[n]}</div><div class="set-actions"><button onclick="addUniversalSet('${n}')" class="btn btn-success">➕ افزودن</button></div></div>`).join('')}</div><div class="examples" style="margin-top:20px;"><strong>📝 گزینه‌ها:</strong><div class="example-buttons"><button onclick="showUniversalSetOperations()" class="btn-example" style="background:#e8f5e9;">🧮 عملیات روی مجموعه‌های جهانی</button><button onclick="checkUniversalMembership()" class="btn-example" style="background:#e3f2fd;">🔍 بررسی عضویت</button><button onclick="checkUniversalSubset()" class="btn-example" style="background:#fff3e0;">📊 بررسی زیرمجموعه</button></div></div><button onclick="showMainMenu()" class="btn btn-secondary">🔙 بازگشت به منوی اصلی</button></div>`;}
function addUniversalSet(n){if(AppState.sets.has(n)){showMessage(`"${n}" تکراری`,'warning');return;}AppState.sets.set(n,{type:'universal',elements:[...AppState.universalSets[n]],infinityType:'left',createdAt:new Date().toISOString()});HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());StorageManager.saveState();updateStats();showMessage(`✅ "${n}" افزوده شد. ${AppState.infiniteSetsInfo[n]}`,'warning',8000);showUniversalSets();}

function showSearch(){document.getElementById("step").innerHTML=`<div class="step-container"><h3>🔎 جستجو</h3><div class="form-group"><label class="form-label">عبارت:</label><input type="text" id="searchQuery" class="form-input" placeholder="5 یا فرد"></div><div class="button-group"><button onclick="performSearch()" class="btn btn-success">🔍 جستجو</button><button onclick="showMainMenu()" class="btn btn-primary">🏠 منوی اصلی</button></div></div>`;}
function performSearch(){const q=document.getElementById('searchQuery').value.trim();if(!q){showMessage('عبارت را وارد کنید','error');return;}const r=SearchManager.search(q);let h='';if(r.length===0)h='<p>نتیجه‌ای نیست.</p>';else r.forEach(x=>{h+=`<div class="search-result-item"><div class="set-name">${x.set}</div><p>${x.match}</p></div>`;});document.getElementById("step").innerHTML=`<div class="step-container"><h3>🔎 "${q}"</h3><p>${r.length} نتیجه</p><div class="search-results">${h}</div><button onclick="showSearch()" class="btn btn-info">🔍 دوباره</button><button onclick="showMainMenu()" class="btn btn-primary">🏠 منوی اصلی</button></div>`;}

// راه‌اندازی - اصلاح شده برای رفع مشکل صفحه بارگذاری
document.addEventListener('DOMContentLoaded',function(){
    console.log('🚀 V.4.42');
    
    // حذف خط StorageManager.clearAllData() که باعث گیر کردن میشد
    
    setTimeout(()=>{
        const l=document.getElementById('loading');
        if(l) l.style.display='none';
    }, 500);
    
    try{
        SetOperationsTests.runAllTests();
    } catch(e){}
    
    HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());
    InputTracker.init();
    SmartKeyboard.init();
    
    document.getElementById('startBtn')?.addEventListener('click', startNew);
    document.getElementById('addSetBtn')?.addEventListener('click', addNewSet);
    document.getElementById('helpBtn')?.addEventListener('click', showHelp);
    document.getElementById('debugBtn')?.addEventListener('click', debugAppState);
    document.getElementById('mainMenuBtn')?.addEventListener('click', goToMainMenu);
    
    document.addEventListener('keydown', function(e){
        if(e.ctrlKey || e.metaKey){
            if(e.key === 'z'){
                e.preventDefault();
                undoLastAction();
            }
        }
    });
    
    updateStats();
    showMainMenu();
    console.log('✅ V.4.42 آماده');
});

document.addEventListener('scroll',function(){
    const b=document.getElementById('scrollToTop');
    if(b){
        if(window.pageYOffset > 300) b.classList.add('show');
        else b.classList.remove('show');
    }
});

document.getElementById('scrollToTop')?.addEventListener('click',function(){
    window.scrollTo({top: 0, behavior: 'smooth'});
});