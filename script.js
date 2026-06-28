// آزمایشگاه مجموعه‌های ریاضی - script.js (نسخه نهایی بهبود یافته) - V.4.05

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
        'ℚ': '⚠️ مجموعه اعداد گویا (ℚ) یک مجموعه نامتناهی است. نمایش کامل تمام اعضای آن ممکن نیست. فقط یک زیرمجموعه نمونه نمایش داده می‌شود.',
        'ℝ': '⚠️ مجموعه اعداد حقیقی (ℝ) یک مجموعه نامتناهی و ناشمارا است. نمایش کامل تمام اعضای آن ممکن نیست. فقط یک زیرمجموعه نمونه شامل اعداد صحیح، گویا و گنگ نمایش داده می‌شود.',
        'ℚ′': '⚠️ مجموعه اعداد گنگ (ℚ′) یک مجموعه نامتناهی و ناشمارا است. نمایش کامل تمام اعضای آن ممکن نیست. فقط چند نمونه از اعداد گنگ معروف (مانند π, e, √2) نمایش داده می‌شود.'
    }
};

// سیستم مدیریت تاریخچه
const HistoryManager = {
    history: [],
    currentIndex: -1,
    maxHistorySize: 20,
    
    getCurrentStateForHistory() {
        return {
            sets: Array.from(AppState.sets.entries()),
            nextSetId: AppState.nextSetId
        };
    },
    
    pushState(state) {
        const currentState = JSON.stringify(this.getCurrentStateForHistory());
        const newState = JSON.stringify(state);
        
        if (currentState === newState) {
            return;
        }
        
        this.history = this.history.slice(0, this.currentIndex + 1);
        const stateCopy = {
            sets: Array.from(state.sets.entries()),
            nextSetId: state.nextSetId,
            timestamp: Date.now()
        };
        
        this.history.push(stateCopy);
        
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
        
        this.currentIndex = this.history.length - 1;
        this.updateUndoButton();
    },
    
    undo() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            const state = this.history[this.currentIndex];
            this.restoreState(state);
            return state;
        }
        return null;
    },
    
    redo() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            const state = this.history[this.currentIndex];
            this.restoreState(state);
            return state;
        }
        return null;
    },
    
    restoreState(state) {
        AppState.sets = new Map(state.sets);
        AppState.nextSetId = state.nextSetId;
        StorageManager.saveState();
        this.updateUndoButton();
        updateStats();
    },
    
    updateUndoButton() {
        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.disabled = this.currentIndex <= 0;
        }
    },
    
    clearHistory() {
        this.history = [];
        this.currentIndex = -1;
        this.updateUndoButton();
    }
};

// سیستم ردیابی input فعال
const InputTracker = {
    activeInput: null,
    
    init() {
        document.addEventListener('focusin', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                this.activeInput = e.target;
            }
        });
    },
    
    getActiveInput() {
        const trulyActive = document.activeElement;
        if (trulyActive && (trulyActive.tagName === "INPUT" || trulyActive.tagName === "TEXTAREA")) {
            this.activeInput = trulyActive;
            return trulyActive;
        }
        return this.activeInput;
    }
};

// مدیریت ذخیره‌سازی
const StorageManager = {
    STORAGE_KEY: 'setLabState_v2',
    
    saveState() {
        try {
            const stateToSave = {
                ...HistoryManager.getCurrentStateForHistory(),
                version: '2.0',
                lastSaved: Date.now()
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave));
            return true;
        } catch (error) {
            console.error('خطا در ذخیره‌سازی:', error);
            return false;
        }
    },
    
    loadState() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const state = JSON.parse(saved);
                
                if (!state.version) {
                    this.migrateFromV1(state);
                }
                
                AppState.sets = new Map(state.sets);
                AppState.nextSetId = state.nextSetId || 1;
                
                HistoryManager.clearHistory();
                HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());
                return true;
            }
        } catch (error) {
            console.error('خطا در بارگذاری:', error);
            this.clearCorruptedData();
        }
        return false;
    },
    
    migrateFromV1(oldState) {
        if (oldState.sets && Array.isArray(oldState.sets)) {
            oldState.sets = oldState.sets;
        }
    },
    
    clearCorruptedData() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem('setLabState');
        } catch (error) {
            console.error('خطا در پاک کردن داده‌های خراب:', error);
        }
    },
    
    clearAllData() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem('setLabState');
            console.log('✅ تمام داده‌های ذخیره شده پاک شدند');
        } catch (error) {
            console.error('خطا در پاک کردن داده‌ها:', error);
        }
    }
};

// سیستم تجزیه‌کننده عبارات نمادین
const SymbolicParser = {
    universalSets: {
        'ℕ': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        '𝕎': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        'ℤ': [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        'ℚ': [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3, 0.333, 0.666, 0.25, 0.75],
        'ℝ': [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3, Math.PI, Math.E, Math.sqrt(2)],
        'ℚ′': [Math.PI, Math.E, Math.sqrt(2), Math.sqrt(3), Math.sqrt(5), Math.sqrt(7)]
    },
    
    infiniteSets: ['ℚ', 'ℝ', 'ℚ′'],

    parse(expression) {
        try {
            console.log('📝 در حال تجزیه عبارت:', expression);
            
            if (!expression || expression.trim() === '') {
                return [];
            }

            const cleaned = this.cleanExpression(expression);
            
            for (const setName of this.infiniteSets) {
                if (cleaned.includes(setName)) {
                    const infoMessages = {
                        'ℚ': '⚠️ مجموعه اعداد گویا (ℚ) یک مجموعه نامتناهی است. نمایش کامل تمام اعضای آن ممکن نیست. فقط یک زیرمجموعه نمونه از اعداد گویا نمایش داده می‌شود.',
                        'ℝ': '⚠️ مجموعه اعداد حقیقی (ℝ) یک مجموعه نامتناهی و ناشمارا است. نمایش کامل تمام اعضای آن ممکن نیست. فقط یک زیرمجموعه نمونه شامل اعداد صحیح، گویا و گنگ نمایش داده می‌شود.',
                        'ℚ′': '⚠️ مجموعه اعداد گنگ (ℚ′) یک مجموعه نامتناهی و ناشمارا است. نمایش کامل تمام اعضای آن ممکن نیست. فقط چند نمونه از اعداد گنگ معروف (مانند π، e، √2، √3) نمایش داده می‌شود.'
                    };
                    showMessage(infoMessages[setName], 'warning', 8000);
                    break;
                }
            }
            
            if (cleaned.includes('{') && cleaned.includes('}')) {
                return this.parseSetNotation(cleaned);
            }
            
            return this.parseSimpleExpression(cleaned);
            
        } catch (error) {
            console.error('❌ خطا در تجزیه:', error);
            throw new Error(`خطا در تجزیه عبارت: ${error.message}`);
        }
    },

    cleanExpression(expr) {
        return expr
            .replace(/\s+/g, ' ')
            .replace(/\\/g, '')
            .trim();
    },

    parseSetNotation(expr) {
        const content = this.extractSetContent(expr);
        
        if (!content.includes('|')) {
            return this.parseSimpleSet(content);
        }
        
        return this.parseSetBuilderNotation(content);
    },

    extractSetContent(expr) {
        const start = expr.indexOf('{');
        const end = expr.lastIndexOf('}');
        
        if (start === -1 || end === -1 || start >= end) {
            throw new Error('ساختار آکولاد نامعتبر است');
        }
        
        return expr.substring(start + 1, end).trim();
    },

    parseSimpleSet(content) {
        const items = content.split(',')
            .map(item => item.trim())
            .filter(item => item !== '');
        
        const result = [];
        for (const item of items) {
            if (item === '∅') {
                return [];
            }
            
            const num = Number(item);
            if (!isNaN(num) && item.trim() !== '') {
                result.push(num);
            } else {
                result.push(item);
            }
        }
        
        return this.removeDuplicates(result);
    },

    parseSetBuilderNotation(content) {
        const parts = content.split('|').map(p => p.trim());
        if (parts.length !== 2) {
            throw new Error('فرمت نامعتبر است. از فرمت {x | شرط} استفاده کنید');
        }

        const conditions = parts[1].split(',').map(c => c.trim()).filter(c => c);
        
        return this.generateFromConditions(conditions);
    },

    parseSimpleExpression(expr) {
        const lowerExpr = expr.toLowerCase();
        
        if (lowerExpr.includes('فرد')) {
            return this.generateOddNumbers(expr);
        }
        
        if (lowerExpr.includes('زوج')) {
            return this.generateEvenNumbers(expr);
        }
        
        if (lowerExpr.includes('اول')) {
            return this.generatePrimeNumbers(expr);
        }
        
        if (lowerExpr.includes('بین') || lowerExpr.includes('تا')) {
            return this.generateRange(expr);
        }
        
        const numbers = this.extractAllNumbers(expr);
        if (numbers.length > 0) {
            return numbers;
        }
        
        throw new Error('عبارت قابل تشخیص نیست. از فرمت‌های مانند "اعداد فرد بین ۱ تا ۱۰" یا "{1,2,3}" استفاده کنید');
    },

    generateFromConditions(conditions) {
        let baseSet = this.getBaseSet(conditions);
        
        for (const condition of conditions) {
            baseSet = this.applyCondition(baseSet, condition);
        }
        
        return this.removeDuplicates(baseSet);
    },

    getBaseSet(conditions) {
        for (const condition of conditions) {
            for (const [setName, setValues] of Object.entries(this.universalSets)) {
                if (condition.includes(setName)) {
                    return [...setValues];
                }
            }
            
            const persianSets = {
                'طبیعی': 'ℕ',
                'حسابی': '𝕎', 
                'صحیح': 'ℤ',
                'گویا': 'ℚ',
                'حقیقی': 'ℝ',
                'گنگ': 'ℚ′',
                'اعداد طبیعی': 'ℕ',
                'اعداد حسابی': '𝕎',
                'اعداد صحیح': 'ℤ',
                'اعداد گویا': 'ℚ',
                'اعداد حقیقی': 'ℝ',
                'اعداد گنگ': 'ℚ′'
            };
            
            for (const [persianName, setName] of Object.entries(persianSets)) {
                if (condition.includes(persianName)) {
                    return [...this.universalSets[setName]];
                }
            }
        }
        
        return Array.from({length: 41}, (_, i) => i - 20);
    },

    applyCondition(set, condition) {
        const lowerCondition = condition.toLowerCase();
        
        if (this.isNumericCondition(condition)) {
            return this.applyNumericCondition(set, condition);
        }
        
        return this.applySpecialCondition(set, lowerCondition);
    },

    isNumericCondition(condition) {
        return /[<>≤≥]=?|-?\d/.test(condition);
    },

    applyNumericCondition(set, condition) {
        const numbers = this.extractAllNumbers(condition);
        if (numbers.length === 0) return set;

        const cleanCondition = condition.replace(/\s+/g, '');
        
        const patterns = [
            { regex: /(-?\d+\.?\d*)<x<(-?\d+\.?\d*)/, handler: (m) => ({ type: 'range', lower: parseFloat(m[1]), upper: parseFloat(m[2]), lowerStrict: true, upperStrict: true })},
            { regex: /(-?\d+\.?\d*)<x<=(-?\d+\.?\d*)/, handler: (m) => ({ type: 'range', lower: parseFloat(m[1]), upper: parseFloat(m[2]), lowerStrict: true, upperStrict: false })},
            { regex: /(-?\d+\.?\d*)<x≤(-?\d+\.?\d*)/, handler: (m) => ({ type: 'range', lower: parseFloat(m[1]), upper: parseFloat(m[2]), lowerStrict: true, upperStrict: false })},
            { regex: /(-?\d+\.?\d*)<=x<(-?\d+\.?\d*)/, handler: (m) => ({ type: 'range', lower: parseFloat(m[1]), upper: parseFloat(m[2]), lowerStrict: false, upperStrict: true })},
            { regex: /(-?\d+\.?\d*)≤x<(-?\d+\.?\d*)/, handler: (m) => ({ type: 'range', lower: parseFloat(m[1]), upper: parseFloat(m[2]), lowerStrict: false, upperStrict: true })},
            { regex: /(-?\d+\.?\d*)<=x<=(-?\d+\.?\d*)/, handler: (m) => ({ type: 'range', lower: parseFloat(m[1]), upper: parseFloat(m[2]), lowerStrict: false, upperStrict: false })},
            { regex: /(-?\d+\.?\d*)≤x≤(-?\d+\.?\d*)/, handler: (m) => ({ type: 'range', lower: parseFloat(m[1]), upper: parseFloat(m[2]), lowerStrict: false, upperStrict: false })},
            { regex: /x>(-?\d+\.?\d*),x<(-?\d+\.?\d*)/, handler: (m) => ({ type: 'range', lower: parseFloat(m[1]), upper: parseFloat(m[2]), lowerStrict: true, upperStrict: true })},
            { regex: /x>=(-?\d+\.?\d*),x<=(-?\d+\.?\d*)/, handler: (m) => ({ type: 'range', lower: parseFloat(m[1]), upper: parseFloat(m[2]), lowerStrict: false, upperStrict: false })},
            { regex: /x≥(-?\d+\.?\d*),x≤(-?\d+\.?\d*)/, handler: (m) => ({ type: 'range', lower: parseFloat(m[1]), upper: parseFloat(m[2]), lowerStrict: false, upperStrict: false })},
            { regex: /x>(-?\d+\.?\d*),x<=(-?\d+\.?\d*)/, handler: (m) => ({ type: 'range', lower: parseFloat(m[1]), upper: parseFloat(m[2]), lowerStrict: true, upperStrict: false })},
            { regex: /x>=(-?\d+\.?\d*),x<(-?\d+\.?\d*)/, handler: (m) => ({ type: 'range', lower: parseFloat(m[1]), upper: parseFloat(m[2]), lowerStrict: false, upperStrict: true })},
            { regex: /x>(-?\d+\.?\d*)/, handler: (m) => ({ type: 'simple', value: parseFloat(m[1]), operator: '>' })},
            { regex: /x>=(-?\d+\.?\d*)/, handler: (m) => ({ type: 'simple', value: parseFloat(m[1]), operator: '>=' })},
            { regex: /x≥(-?\d+\.?\d*)/, handler: (m) => ({ type: 'simple', value: parseFloat(m[1]), operator: '>=' })},
            { regex: /x<(-?\d+\.?\d*)/, handler: (m) => ({ type: 'simple', value: parseFloat(m[1]), operator: '<' })},
            { regex: /x<=(-?\d+\.?\d*)/, handler: (m) => ({ type: 'simple', value: parseFloat(m[1]), operator: '<=' })},
            { regex: /x≤(-?\d+\.?\d*)/, handler: (m) => ({ type: 'simple', value: parseFloat(m[1]), operator: '<=' })},
            { regex: /x=(-?\d+\.?\d*)/, handler: (m) => ({ type: 'simple', value: parseFloat(m[1]), operator: '=' })},
            { regex: /x==(-?\d+\.?\d*)/, handler: (m) => ({ type: 'simple', value: parseFloat(m[1]), operator: '=' })},
            { regex: /(-?\d+\.?\d*)<x(?!<|>|<=|>=|≤|≥)/, handler: (m) => ({ type: 'simple', value: parseFloat(m[1]), operator: '>' })},
            { regex: /(-?\d+\.?\d*)<=x(?!<|>|<=|>=|≤|≥)/, handler: (m) => ({ type: 'simple', value: parseFloat(m[1]), operator: '>=' })},
            { regex: /(-?\d+\.?\d*)≤x(?!<|>|<=|>=|≤|≥)/, handler: (m) => ({ type: 'simple', value: parseFloat(m[1]), operator: '>=' })},
            { regex: /(-?\d+\.?\d*)>x(?!<|>|<=|>=|≤|≥)/, handler: (m) => ({ type: 'simple', value: parseFloat(m[1]), operator: '<' })},
            { regex: /(-?\d+\.?\d*)>=x(?!<|>|<=|>=|≤|≥)/, handler: (m) => ({ type: 'simple', value: parseFloat(m[1]), operator: '<=' })},
            { regex: /(-?\d+\.?\d*)≥x(?!<|>|<=|>=|≤|≥)/, handler: (m) => ({ type: 'simple', value: parseFloat(m[1]), operator: '<=' })}
        ];

        for (const pattern of patterns) {
            const match = cleanCondition.match(pattern.regex);
            if (match) {
                const result = pattern.handler(match);
                
                if (result.type === 'range') {
                    return set.filter(x => 
                        (result.lowerStrict ? x > result.lower : x >= result.lower) && 
                        (result.upperStrict ? x < result.upper : x <= result.upper)
                    );
                } else if (result.type === 'simple') {
                    switch(result.operator) {
                        case '>': return set.filter(x => x > result.value);
                        case '>=': return set.filter(x => x >= result.value);
                        case '<': return set.filter(x => x < result.value);
                        case '<=': return set.filter(x => x <= result.value);
                        case '=': return set.filter(x => x === result.value);
                    }
                }
            }
        }

        if (numbers.length >= 2) {
            const lower = Math.min(numbers[0], numbers[1]);
            const upper = Math.max(numbers[0], numbers[1]);
            const lowerStrict = cleanCondition.includes('<') && !cleanCondition.includes('<=') && !cleanCondition.includes('≤');
            const upperStrict = cleanCondition.includes('<') && !cleanCondition.includes('<=') && !cleanCondition.includes('≤');
            
            return set.filter(x => 
                (lowerStrict ? x > lower : x >= lower) && 
                (upperStrict ? x < upper : x <= upper)
            );
        }
        
        if (numbers.length === 1) {
            if (condition.includes('<') || condition.includes('>') || condition.includes('=') || condition.includes('≤') || condition.includes('≥')) {
                return set;
            } else {
                return set.filter(x => x === numbers[0]);
            }
        }
        
        return set;
    },

    applySpecialCondition(set, condition) {
        if (condition.includes('فرد') || condition.includes('odd')) {
            return set.filter(x => typeof x === 'number' && Math.abs(x % 2) === 1);
        }
        
        if (condition.includes('زوج') || condition.includes('even')) {
            return set.filter(x => typeof x === 'number' && x % 2 === 0);
        }
        
        if (condition.includes('اول') || condition.includes('prime')) {
            return set.filter(x => typeof x === 'number' && this.isPrime(x));
        }
        
        if (condition.includes('مثبت')) {
            return set.filter(x => typeof x === 'number' && x > 0);
        }
        
        if (condition.includes('منفی')) {
            return set.filter(x => typeof x === 'number' && x < 0);
        }
        
        if (condition.includes('صحیح') || condition.includes('integer')) {
            return set.filter(x => typeof x === 'number' && Number.isInteger(x));
        }
        
        return set;
    },

    generateOddNumbers(expr) {
        const numbers = this.extractAllNumbers(expr);
        let start = 1, end = 10;
        
        if (numbers.length >= 2) {
            start = Math.min(numbers[0], numbers[1]);
            end = Math.max(numbers[0], numbers[1]);
        } else if (numbers.length === 1) {
            end = numbers[0];
        }
        
        const result = [];
        for (let i = start; i <= end; i++) {
            if (Math.abs(i % 2) === 1) {
                result.push(i);
            }
        }
        return result;
    },

    generateEvenNumbers(expr) {
        const numbers = this.extractAllNumbers(expr);
        let start = 2, end = 10;
        
        if (numbers.length >= 2) {
            start = Math.min(numbers[0], numbers[1]);
            end = Math.max(numbers[0], numbers[1]);
        } else if (numbers.length === 1) {
            end = numbers[0];
        }
        
        const result = [];
        for (let i = start; i <= end; i++) {
            if (i % 2 === 0) {
                result.push(i);
            }
        }
        return result;
    },

    generatePrimeNumbers(expr) {
        const numbers = this.extractAllNumbers(expr);
        const limit = numbers.length > 0 ? Math.max(...numbers) : 20;
        const start = numbers.length > 1 ? Math.min(...numbers) : 2;
        
        const result = [];
        for (let i = Math.max(2, start); i <= limit; i++) {
            if (this.isPrime(i)) {
                result.push(i);
            }
        }
        return result;
    },

    generateRange(expr) {
        const numbers = this.extractAllNumbers(expr);
        if (numbers.length < 2) {
            throw new Error('برای تولید بازه حداقل دو عدد نیاز است');
        }
        
        const start = Math.min(numbers[0], numbers[1]);
        const end = Math.max(numbers[0], numbers[1]);
        const result = [];
        
        for (let i = start; i <= end; i++) {
            result.push(i);
        }
        
        return result;
    },

    extractAllNumbers(text) {
        const numbers = [];
        const matches = text.match(/-?\d+(\.\d+)?/g) || [];
        
        for (const match of matches) {
            const num = parseFloat(match);
            if (!isNaN(num)) {
                numbers.push(num);
            }
        }
        
        return numbers;
    },

    isPrime(num) {
        if (num < 2 || !Number.isInteger(num)) return false;
        if (num === 2) return true;
        if (num % 2 === 0) return false;
        
        for (let i = 3; i <= Math.sqrt(num); i += 2) {
            if (num % i === 0) return false;
        }
        return true;
    },

    removeDuplicates(arr) {
        return [...new Set(arr)].sort((a, b) => {
            if (typeof a === 'number' && typeof b === 'number') return a - b;
            return String(a).localeCompare(String(b));
        });
    }
};

// توابع کمکی عمومی
function isPrime(num) {
    if (num < 2 || !Number.isInteger(num)) return false;
    if (num === 2) return true;
    if (num % 2 === 0) return false;
    
    for (let i = 3; i <= Math.sqrt(num); i += 2) {
        if (num % i === 0) return false;
    }
    return true;
}

function generatePrimeNumbersInRange(start, end) {
    const primes = [];
    for (let i = Math.max(2, start); i <= end; i++) {
        if (isPrime(i)) {
            primes.push(i);
        }
    }
    return primes;
}

function generatePrimeNumbers(limit) {
    const primes = [];
    for (let i = 2; i <= limit; i++) {
        if (isPrime(i)) primes.push(i);
    }
    return primes;
}

function extractNumbers(text) {
    const numbers = [];
    const numberRegex = /-?\d+(\.\d+)?/g;
    let match;
    
    while ((match = numberRegex.exec(text)) !== null) {
        numbers.push(parseFloat(match[0]));
    }
    
    return numbers;
}

function removeDuplicatesWithWarning(elements) {
    if (!Array.isArray(elements)) {
        return [];
    }
    
    const seen = new Set();
    const unique = [];
    const duplicates = [];
    
    elements.forEach(item => {
        let processedItem = item;
        if (typeof item === 'string' && item.trim() !== '' && !isNaN(Number(item))) {
            processedItem = Number(item);
        }
        
        const key = processedItem;
        
        if (seen.has(key)) {
            duplicates.push(item);
        } else {
            seen.add(key);
            unique.push(processedItem);
        }
    });
    
    if (duplicates.length > 0) {
        showMessage(`${duplicates.length} عضو تکراری حذف شد`, 'warning', 3000);
    }
    
    return unique.sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        return String(a).localeCompare(String(b));
    });
}

// سیستم جستجو
const SearchManager = {
    search(query) {
        if (!query || query.trim() === '') {
            return [];
        }
        
        const results = [];
        const lowerQuery = query.toLowerCase().trim();
        
        AppState.sets.forEach((setData, setName) => {
            if (setName.toLowerCase().includes(lowerQuery)) {
                results.push({ 
                    type: 'setName', 
                    set: setName, 
                    data: setData,
                    match: `نام مجموعه: ${setName}`
                });
            }
            
            const matchingElements = setData.elements.filter(element => 
                element.toString().toLowerCase().includes(lowerQuery)
            );
            
            if (matchingElements.length > 0) {
                results.push({ 
                    type: 'elements', 
                    set: setName, 
                    elements: matchingElements,
                    data: setData,
                    match: `اعضای مجموعه ${setName}: ${matchingElements.join(', ')}`
                });
            }
            
            if (setData.description && setData.description.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'description',
                    set: setName,
                    data: setData,
                    match: `توصیف مجموعه ${setName}: ${setData.description}`
                });
            }
        });
        
        return results;
    }
};

// مدیریت کیبورد هوشمند
const SmartKeyboard = {
    isOpen: false,
    
    init() {
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        const kbBtn = document.getElementById('kbBtn');
        const closeBtn = document.querySelector('.btn-close-kb');
        
        if (kbBtn) kbBtn.addEventListener('click', () => this.toggle());
        if (closeBtn) closeBtn.addEventListener('click', () => this.hide());
        
        document.querySelectorAll('.btn-keyboard[data-symbol]').forEach(button => {
            button.addEventListener('click', (e) => {
                const symbol = e.currentTarget.getAttribute('data-symbol');
                if (symbol === 'backspace') {
                    this.backspace();
                } else {
                    this.insertSymbol(symbol);
                }
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.hide();
            }
        });
    },
    
    toggle() {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    },
    
    show() {
        const keyboard = document.getElementById('keyboard');
        const body = document.body;
        if (keyboard) {
            keyboard.style.display = 'flex';
            setTimeout(() => {
                keyboard.classList.add('show');
                body.classList.add('keyboard-open');
                this.isOpen = true;
            }, 10);
        }
    },
    
    hide() {
        const keyboard = document.getElementById('keyboard');
        const body = document.body;
        if (keyboard) {
            keyboard.classList.remove('show');
            body.classList.remove('keyboard-open');
            setTimeout(() => {
                keyboard.style.display = 'none';
                this.isOpen = false;
            }, 400);
        }
    },
    
    insertSymbol(symbol) {
        let activeInput = InputTracker.getActiveInput();
        if (!activeInput) {
            const firstInput = document.querySelector('input, textarea');
            if (firstInput) {
                firstInput.focus();
                activeInput = firstInput;
            } else {
                showMessage('لطفاً ابتدا یک فیلد ورودی را انتخاب کنید', 'warning');
                return;
            }
        }
        
        const start = activeInput.selectionStart;
        const end = activeInput.selectionEnd;
        const currentValue = activeInput.value;
        
        activeInput.value = currentValue.substring(0, start) + symbol + currentValue.substring(end);
        const newPosition = start + symbol.length;
        activeInput.setSelectionRange(newPosition, newPosition);
        activeInput.focus();
        activeInput.dispatchEvent(new Event('input', { bubbles: true }));
    },
    
    backspace() {
        let activeInput = InputTracker.getActiveInput();
        if (!activeInput) return;
        
        const start = activeInput.selectionStart;
        const end = activeInput.selectionEnd;
        const value = activeInput.value;
        
        if (start === end && start > 0) {
            activeInput.value = value.substring(0, start - 1) + value.substring(end);
            activeInput.setSelectionRange(start - 1, start - 1);
        } else if (start !== end) {
            activeInput.value = value.substring(0, start) + value.substring(end);
            activeInput.setSelectionRange(start, start);
        }
        activeInput.focus();
        activeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
};

// تست‌های واحد
const SetOperationsTests = {
    testUnion() {
        const result = union([1, 2, 3], [3, 4, 5]);
        const expected = [1, 2, 3, 4, 5];
        console.assert(JSON.stringify(result) === JSON.stringify(expected), 'Union test failed');
    },
    
    testIntersection() {
        const result = intersection([1, 2, 3], [2, 3, 4]);
        const expected = [2, 3];
        console.assert(JSON.stringify(result) === JSON.stringify(expected), 'Intersection test failed');
    },
    
    testDifference() {
        const result = difference([1, 2, 3, 4], [3, 4, 5]);
        const expected = [1, 2];
        console.assert(JSON.stringify(result) === JSON.stringify(expected), 'Difference test failed');
    },
    
    testSymmetricDifference() {
        const result = symmetricDifference([1, 2, 3], [2, 3, 4]);
        const expected = [1, 4];
        console.assert(JSON.stringify(result) === JSON.stringify(expected), 'Symmetric difference test failed');
    },
    
    testSubset() {
        const result = isSubsetOf([1, 2], [1, 2, 3]);
        const expected = true;
        console.assert(result === expected, 'Subset test failed');
    },
    
    runAllTests() {
        try {
            this.testUnion();
            this.testIntersection();
            this.testDifference();
            this.testSymmetricDifference();
            this.testSubset();
            console.log('✅ All tests passed!');
        } catch (error) {
            console.error('❌ Some tests failed:', error);
        }
    }
};

// توابع عملیات مجموعه‌ای
function union(setA, setB) {
    const result = [...new Set([...setA, ...setB])];
    return result.sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        return String(a).localeCompare(String(b));
    });
}

function intersection(setA, setB) {
    const setBSet = new Set(setB);
    const result = setA.filter(x => setBSet.has(x));
    return result.sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        return String(a).localeCompare(String(b));
    });
}

function difference(setA, setB) {
    const setBSet = new Set(setB);
    const result = setA.filter(x => !setBSet.has(x));
    return result.sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        return String(a).localeCompare(String(b));
    });
}

function symmetricDifference(setA, setB) {
    const diffAB = difference(setA, setB);
    const diffBA = difference(setB, setA);
    return union(diffAB, diffBA);
}

function isSubsetOf(setA, setB) {
    const setBSet = new Set(setB);
    return setA.every(element => setBSet.has(element));
}

function showMessage(message, type = 'info', duration = 5000) {
    const messagesContainer = document.getElementById('systemMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message message-fade`;
    messageDiv.textContent = message;
    
    messagesContainer.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }
    }, duration);
}

function formatSet(elements) {
    if (!elements || elements.length === 0) {
        return '∅';
    }
    return `{ ${elements.join(', ')} }`;
}

function parseSet(input) {
    if (!input || input.trim() === '') return [];
    
    const elements = input.split(',')
        .map(item => item.trim())
        .filter(item => item !== '');
    
    const processedElements = elements.map(item => {
        if (item === '∅') return [];
        
        const num = Number(item);
        if (!isNaN(num) && item.trim() !== '') return num;
        
        return item;
    }).flat();
    
    return removeDuplicatesWithWarning(processedElements);
}

function parseSymbolicExpression(expression) {
    return SymbolicParser.parse(expression);
}

function parseVerbalDescription(description) {
    try {
        if (!description || typeof description !== 'string') {
            return [1, 2, 3, 4, 5];
        }
        
        const lowerDesc = description.toLowerCase().trim();
        let result = [];
        
        if (lowerDesc.includes('اول')) {
            if (lowerDesc.includes('بین')) {
                const numbers = extractNumbers(lowerDesc);
                if (numbers.length >= 2) {
                    const start = Math.max(2, numbers[0]);
                    const end = numbers[1];
                    return generatePrimeNumbersInRange(start, end);
                }
            } else if (lowerDesc.includes('کوچکتر') || lowerDesc.includes('کمتر')) {
                const numbers = extractNumbers(lowerDesc);
                if (numbers.length > 0) {
                    const limit = numbers[0];
                    return generatePrimeNumbers(Math.max(2, limit - 1));
                }
            }
        }
        
        if (lowerDesc.includes('فرد')) {
            const numbers = extractNumbers(lowerDesc);
            if (lowerDesc.includes('بین') && numbers.length >= 2) {
                const start = Math.min(numbers[0], numbers[1]);
                const end = Math.max(numbers[0], numbers[1]);
                for (let i = start; i <= end; i++) {
                    if (i % 2 === 1 || i % 2 === -1) result.push(i);
                }
                return result;
            } else if ((lowerDesc.includes('کوچکتر') || lowerDesc.includes('کمتر')) && numbers.length > 0) {
                const limit = numbers[0];
                for (let i = 1; i < limit; i += 2) {
                    result.push(i);
                }
                return result;
            } else {
                return [1, 3, 5, 7, 9];
            }
        }
        
        if (lowerDesc.includes('زوج')) {
            const numbers = extractNumbers(lowerDesc);
            if (lowerDesc.includes('بین') && numbers.length >= 2) {
                const start = Math.min(numbers[0], numbers[1]);
                const end = Math.max(numbers[0], numbers[1]);
                for (let i = start; i <= end; i++) {
                    if (i % 2 === 0) result.push(i);
                }
                return result;
            } else if ((lowerDesc.includes('کوچکتر') || lowerDesc.includes('کمتر')) && numbers.length > 0) {
                const limit = numbers[0];
                for (let i = 2; i < limit; i += 2) {
                    result.push(i);
                }
                return result;
            } else {
                return [2, 4, 6, 8, 10];
            }
        }
        
        if (lowerDesc.includes('صحیح') || lowerDesc.includes('عددی')) {
            const numbers = extractNumbers(lowerDesc);
            if (lowerDesc.includes('بین') && numbers.length >= 2) {
                const start = Math.min(numbers[0], numbers[1]);
                const end = Math.max(numbers[0], numbers[1]);
                for (let i = start; i <= end; i++) {
                    result.push(i);
                }
                return result;
            }
        }
        
        if (lowerDesc.includes('طبیعی')) {
            const numbers = extractNumbers(lowerDesc);
            if (lowerDesc.includes('بین') && numbers.length >= 2) {
                const start = Math.max(1, Math.min(numbers[0], numbers[1]));
                const end = Math.max(numbers[0], numbers[1]);
                for (let i = start; i <= end; i++) {
                    result.push(i);
                }
                return result;
            }
        }
        
        if (lowerDesc.includes('حسابی')) {
            const numbers = extractNumbers(lowerDesc);
            if ((lowerDesc.includes('کوچکتر') || lowerDesc.includes('کمتر')) && numbers.length > 0) {
                const limit = numbers[0];
                for (let i = 0; i < limit; i++) {
                    result.push(i);
                }
                return result;
            }
        }
        
        if (lowerDesc.includes('مضرب')) {
            const numbers = extractNumbers(lowerDesc);
            if (numbers.length >= 1) {
                const multiple = numbers[0];
                let start = multiple, end = multiple * 5;
                
                if (lowerDesc.includes('بین') && numbers.length >= 3) {
                    start = Math.min(numbers[1], numbers[2]);
                    end = Math.max(numbers[1], numbers[2]);
                }
                
                for (let i = start; i <= end; i++) {
                    if (i % multiple === 0) result.push(i);
                }
                return result;
            }
        }
        
        const numbers = extractNumbers(lowerDesc);
        if (numbers.length > 0) {
            return removeDuplicatesWithWarning(numbers);
        }
        
        return [1, 2, 3, 4, 5];
        
    } catch (error) {
        console.error('خطا در پردازش توصیف کلامی:', error);
        showMessage(`خطا در پردازش توصیف: ${error.message}`, 'error');
        return [1, 2, 3, 4, 5];
    }
}

function getTypeName(type) {
    const typeNames = {
        'symbolic': 'نمادین',
        'verbal': 'کلامی',
        'normal': 'عادی',
        'universal': 'جهانی',
        'quick': 'سریع',
        'operation': 'عملیات'
    };
    return typeNames[type] || type;
}

function updateStats() {
    document.getElementById('sets-count').textContent = AppState.sets.size;
    
    let totalElements = 0;
    AppState.sets.forEach(setData => {
        totalElements += setData.elements ? setData.elements.length : 0;
    });
    document.getElementById('elements-count').textContent = totalElements;
    
    document.getElementById('active-sets-count').textContent = AppState.sets.size;
    document.getElementById('total-elements-count').textContent = totalElements;
}

function quickCreateSet(name, elements) {
    if (AppState.sets.has(name)) {
        showMessage(`مجموعه "${name}" از قبل وجود دارد`, 'warning');
        return;
    }
    
    const uniqueElements = removeDuplicatesWithWarning(elements);
    
    AppState.sets.set(name, {
        type: 'quick',
        elements: uniqueElements,
        createdAt: new Date().toISOString()
    });
    
    HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());
    StorageManager.saveState();
    updateStats();
    showMessage(`✅ مجموعه "${name}" ایجاد شد: ${formatSet(uniqueElements)}`, 'success');
    showAllSets();
}

// ========== توابع تبدیل فرمت‌ها ==========

// تبدیل عادی (لیست اعداد) به نمادین
function convertNormalToSymbolic() {
    const input = document.getElementById('convertInput').value.trim();
    if (!input) {
        showMessage('لطفاً اعضای مجموعه را وارد کنید', 'error');
        return;
    }
    
    const elements = parseSet(input);
    if (elements.length === 0) {
        showMessage('مجموعه خالی است', 'warning');
        return;
    }
    
    const numericElements = elements.filter(x => typeof x === 'number');
    if (numericElements.length === 0) {
        document.getElementById('convertResult').innerHTML = `
            <p><strong>مجموعه نمادین:</strong></p>
            <div class="conversion-box">{ ${elements.join(', ')} }</div>
            <p style="color: #856404;">⚠️ این مجموعه شامل اعداد نیست و نمی‌توان آن را با شرط‌های ریاضی نمایش داد.</p>
        `;
        return;
    }
    
    const min = Math.min(...numericElements);
    const max = Math.max(...numericElements);
    
    // تشخیص نوع اعداد
    let universalSet = 'ℤ';
    let allPositive = numericElements.every(x => x >= 0);
    let allIntegers = numericElements.every(x => Number.isInteger(x));
    let allNatural = numericElements.every(x => x >= 1 && Number.isInteger(x));
    let allWhole = numericElements.every(x => x >= 0 && Number.isInteger(x));
    
    if (allNatural && min >= 1) {
        universalSet = 'ℕ';
    } else if (allWhole && min >= 0) {
        universalSet = '𝕎';
    } else if (allIntegers) {
        universalSet = 'ℤ';
    }
    
    // بررسی الگوهای خاص
    let symbolicExpression = '';
    
    // بررسی اعداد فرد/زوج
    const allOdd = numericElements.every(x => Math.abs(x % 2) === 1);
    const allEven = numericElements.every(x => x % 2 === 0);
    const allPrime = numericElements.every(x => isPrime(x)) && numericElements.length > 1 && min >= 2;
    
    // بررسی توالی کامل
    const isFullRange = numericElements.length === (max - min + 1);
    const expectedRange = [];
    for (let i = min; i <= max; i++) {
        if (allOdd && Math.abs(i % 2) === 1) expectedRange.push(i);
        else if (allEven && i % 2 === 0) expectedRange.push(i);
        else if (!allOdd && !allEven) expectedRange.push(i);
    }
    const isSequential = JSON.stringify(numericElements) === JSON.stringify(expectedRange);
    
    if (allOdd && isSequential) {
        symbolicExpression = `{ x | x ∈ ${universalSet}, ${min} ≤ x ≤ ${max}, x فرد }`;
    } else if (allEven && isSequential) {
        symbolicExpression = `{ x | x ∈ ${universalSet}, ${min} ≤ x ≤ ${max}, x زوج }`;
    } else if (allPrime && min >= 2) {
        symbolicExpression = `{ x | x ∈ ${universalSet}, x اول, ${min} ≤ x ≤ ${max} }`;
    } else if (isFullRange) {
        symbolicExpression = `{ x | x ∈ ${universalSet}, ${min} ≤ x ≤ ${max} }`;
    } else {
        symbolicExpression = `{ ${elements.join(', ')} }`;
    }
    
    document.getElementById('convertResult').innerHTML = `
        <p><strong>مجموعه اصلی (عادی):</strong></p>
        <div class="conversion-box">${formatSet(elements)}</div>
        <div class="conversion-arrow">⬇️</div>
        <p><strong>مجموعه نمادین:</strong></p>
        <div class="conversion-box">${symbolicExpression}</div>
    `;
}

// تبدیل عادی به کلامی
function convertNormalToVerbal() {
    const input = document.getElementById('convertInput').value.trim();
    if (!input) {
        showMessage('لطفاً اعضای مجموعه را وارد کنید', 'error');
        return;
    }
    
    const elements = parseSet(input);
    if (elements.length === 0) {
        showMessage('مجموعه خالی است', 'warning');
        return;
    }
    
    const numericElements = elements.filter(x => typeof x === 'number');
    if (numericElements.length === 0) {
        document.getElementById('convertResult').innerHTML = `
            <p><strong>مجموعه کلامی:</strong></p>
            <div class="conversion-box">مجموعه‌ای شامل اعضای: ${elements.join('، ')}</div>
        `;
        return;
    }
    
    const min = Math.min(...numericElements);
    const max = Math.max(...numericElements);
    const allOdd = numericElements.every(x => Math.abs(x % 2) === 1);
    const allEven = numericElements.every(x => x % 2 === 0);
    const allPrime = numericElements.every(x => isPrime(x)) && min >= 2;
    const isFullRange = numericElements.length === (max - min + 1);
    const isInteger = numericElements.every(x => Number.isInteger(x));
    
    let verbalDescription = '';
    
    if (allOdd && isInteger) {
        verbalDescription = `اعداد فرد بین ${min} تا ${max}`;
    } else if (allEven && isInteger) {
        verbalDescription = `اعداد زوج بین ${min} تا ${max}`;
    } else if (allPrime && isInteger) {
        if (max - min <= 15) {
            verbalDescription = `اعداد اول بین ${min} تا ${max}`;
        } else {
            verbalDescription = `اعداد اول کوچکتر از ${max}`;
        }
    } else if (isFullRange && isInteger && min >= 0) {
        if (min >= 1) {
            verbalDescription = `اعداد طبیعی بین ${min} تا ${max}`;
        } else {
            verbalDescription = `اعداد حسابی بین ${min} تا ${max}`;
        }
    } else if (isFullRange && isInteger && min < 0) {
        verbalDescription = `اعداد صحیح بین ${min} تا ${max}`;
    } else {
        verbalDescription = `مجموعه‌ای شامل اعداد ${elements.join('، ')}`;
    }
    
    document.getElementById('convertResult').innerHTML = `
        <p><strong>مجموعه اصلی (عادی):</strong></p>
        <div class="conversion-box">${formatSet(elements)}</div>
        <div class="conversion-arrow">⬇️</div>
        <p><strong>توصیف کلامی:</strong></p>
        <div class="conversion-box">${verbalDescription}</div>
    `;
}

// تبدیل کلامی به نمادین
function convertVerbalToSymbolic() {
    const input = document.getElementById('convertInput').value.trim();
    if (!input) {
        showMessage('لطفاً توصیف کلامی را وارد کنید', 'error');
        return;
    }
    
    try {
        const elements = parseVerbalDescription(input);
        const numericElements = elements.filter(x => typeof x === 'number');
        
        if (numericElements.length === 0) {
            document.getElementById('convertResult').innerHTML = `
                <p><strong>توصیف کلامی:</strong></p>
                <div class="conversion-box">${input}</div>
                <div class="conversion-arrow">⬇️</div>
                <p><strong>مجموعه نمادین:</strong></p>
                <div class="conversion-box">{ ${elements.join(', ')} }</div>
            `;
            return;
        }
        
        const min = Math.min(...numericElements);
        const max = Math.max(...numericElements);
        const lowerDesc = input.toLowerCase();
        
        let universalSet = 'ℤ';
        if (lowerDesc.includes('طبیعی')) universalSet = 'ℕ';
        else if (lowerDesc.includes('حسابی')) universalSet = '𝕎';
        else if (lowerDesc.includes('صحیح')) universalSet = 'ℤ';
        else if (numericElements.every(x => x >= 1 && Number.isInteger(x))) universalSet = 'ℕ';
        else if (numericElements.every(x => x >= 0 && Number.isInteger(x))) universalSet = '𝕎';
        
        let symbolicExpression = '';
        
        if (lowerDesc.includes('فرد')) {
            symbolicExpression = `{ x | x ∈ ${universalSet}, ${min} ≤ x ≤ ${max}, x فرد }`;
        } else if (lowerDesc.includes('زوج')) {
            symbolicExpression = `{ x | x ∈ ${universalSet}, ${min} ≤ x ≤ ${max}, x زوج }`;
        } else if (lowerDesc.includes('اول')) {
            symbolicExpression = `{ x | x ∈ ${universalSet}, x اول, ${min} ≤ x ≤ ${max} }`;
        } else {
            symbolicExpression = `{ x | x ∈ ${universalSet}, ${min} ≤ x ≤ ${max} }`;
        }
        
        document.getElementById('convertResult').innerHTML = `
            <p><strong>توصیف کلامی:</strong></p>
            <div class="conversion-box">${input}</div>
            <div class="conversion-arrow">⬇️</div>
            <p><strong>مجموعه نمادین:</strong></p>
            <div class="conversion-box">${symbolicExpression}</div>
            <p style="margin-top: 10px;"><strong>اعضای مجموعه:</strong> ${formatSet(elements)}</p>
        `;
    } catch (error) {
        showMessage(`❌ خطا در تبدیل: ${error.message}`, 'error');
    }
}

// تبدیل نمادین به کلامی
function convertSymbolicToVerbal() {
    const input = document.getElementById('convertInput').value.trim();
    if (!input) {
        showMessage('لطفاً عبارت نمادین را وارد کنید', 'error');
        return;
    }
    
    try {
        const elements = parseSymbolicExpression(input);
        const numericElements = elements.filter(x => typeof x === 'number');
        
        if (numericElements.length === 0) {
            document.getElementById('convertResult').innerHTML = `
                <p><strong>عبارت نمادین:</strong></p>
                <div class="conversion-box">${input}</div>
                <div class="conversion-arrow">⬇️</div>
                <p><strong>توصیف کلامی:</strong></p>
                <div class="conversion-box">مجموعه‌ای شامل: ${elements.join('، ')}</div>
            `;
            return;
        }
        
        const min = Math.min(...numericElements);
        const max = Math.max(...numericElements);
        const allOdd = numericElements.every(x => Math.abs(x % 2) === 1);
        const allEven = numericElements.every(x => x % 2 === 0);
        const allPrime = numericElements.every(x => isPrime(x)) && min >= 2;
        const isFullRange = numericElements.length === (max - min + 1);
        const isInteger = numericElements.every(x => Number.isInteger(x));
        
        let verbalDescription = '';
        const lowerInput = input.toLowerCase();
        
        if (lowerInput.includes('فرد') && isInteger) {
            verbalDescription = `اعداد فرد بین ${min} تا ${max}`;
        } else if (lowerInput.includes('زوج') && isInteger) {
            verbalDescription = `اعداد زوج بین ${min} تا ${max}`;
        } else if (lowerInput.includes('اول') && isInteger) {
            verbalDescription = `اعداد اول بین ${min} تا ${max}`;
        } else if (allOdd && isInteger) {
            verbalDescription = `اعداد فرد بین ${min} تا ${max}`;
        } else if (allEven && isInteger) {
            verbalDescription = `اعداد زوج بین ${min} تا ${max}`;
        } else if (allPrime && isInteger) {
            verbalDescription = `اعداد اول بین ${min} تا ${max}`;
        } else if (isFullRange && isInteger) {
            if (lowerInput.includes('ℕ') || (min >= 1)) {
                verbalDescription = `اعداد طبیعی بین ${min} تا ${max}`;
            } else if (lowerInput.includes('𝕎') || (min >= 0)) {
                verbalDescription = `اعداد حسابی بین ${min} تا ${max}`;
            } else if (lowerInput.includes('ℤ') || min < 0) {
                verbalDescription = `اعداد صحیح بین ${min} تا ${max}`;
            } else {
                verbalDescription = `اعداد بین ${min} تا ${max}`;
            }
        } else {
            verbalDescription = `مجموعه‌ای شامل اعداد ${numericElements.join('، ')}`;
        }
        
        document.getElementById('convertResult').innerHTML = `
            <p><strong>عبارت نمادین:</strong></p>
            <div class="conversion-box">${input}</div>
            <div class="conversion-arrow">⬇️</div>
            <p><strong>توصیف کلامی:</strong></p>
            <div class="conversion-box">${verbalDescription}</div>
            <p style="margin-top: 10px;"><strong>اعضای مجموعه:</strong> ${formatSet(elements)}</p>
        `;
    } catch (error) {
        showMessage(`❌ خطا در تبدیل: ${error.message}`, 'error');
    }
}

// نمایش صفحه تبدیل
function showConversionPage(conversionType) {
    const titles = {
        'normalToSymbolic': 'تبدیل عادی به نمادین',
        'normalToVerbal': 'تبدیل عادی به کلامی',
        'verbalToSymbolic': 'تبدیل کلامی به نمادین',
        'symbolicToVerbal': 'تبدیل نمادین به کلامی'
    };
    
    const placeholders = {
        'normalToSymbolic': 'مثال: 1,3,5,7,9',
        'normalToVerbal': 'مثال: 1,3,5,7,9',
        'verbalToSymbolic': 'مثال: اعداد فرد بین ۱ تا ۱۰',
        'symbolicToVerbal': 'مثال: { x | x ∈ ℕ, x ≤ 10 }'
    };
    
    const descriptions = {
        'normalToSymbolic': 'اعضای مجموعه را با کاما وارد کنید تا به فرمت نمادین تبدیل شود.',
        'normalToVerbal': 'اعضای مجموعه را با کاما وارد کنید تا به توصیف کلامی تبدیل شود.',
        'verbalToSymbolic': 'توصیف فارسی مجموعه را وارد کنید تا به فرمت نمادین تبدیل شود.',
        'symbolicToVerbal': 'عبارت نمادین مجموعه را وارد کنید تا به توصیف کلامی تبدیل شود.'
    };
    
    const convertFunctions = {
        'normalToSymbolic': 'convertNormalToSymbolic()',
        'normalToVerbal': 'convertNormalToVerbal()',
        'verbalToSymbolic': 'convertVerbalToSymbolic()',
        'symbolicToVerbal': 'convertSymbolicToVerbal()'
    };
    
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>🔄 ${titles[conversionType]}</h3>
            <p>${descriptions[conversionType]}</p>
            
            <div class="form-group">
                <label class="form-label">ورودی:</label>
                <input type="text" id="convertInput" class="form-input" 
                       placeholder="${placeholders[conversionType]}">
            </div>
            
            <div class="examples">
                <strong>📝 نمونه‌های آماده (کلیک کنید):</strong>
                <div class="example-buttons">
                    <button onclick="fillConvertExample('1,3,5,7,9')" class="btn-example">
                        1,3,5,7,9 → اعداد فرد ۱ تا ۹
                    </button>
                    <button onclick="fillConvertExample('2,4,6,8,10')" class="btn-example">
                        2,4,6,8,10 → اعداد زوج ۲ تا ۱۰
                    </button>
                    <button onclick="fillConvertExample('-2,-1,0,1,2')" class="btn-example">
                        -2,-1,0,1,2 → اعداد -۲ تا ۲
                    </button>
                    <button onclick="fillConvertExample('اعداد فرد بین ۱ تا ۱۰')" class="btn-example">
                        اعداد فرد بین ۱ تا ۱۰
                    </button>
                    <button onclick="fillConvertExample('{ x | x ∈ ℤ, -4 < x < 5 }')" class="btn-example">
                        { x | x ∈ ℤ, -4 < x < 5 }
                    </button>
                </div>
            </div>
            
            <div class="button-group">
                <button onclick="${convertFunctions[conversionType]}" class="btn btn-success">🔄 تبدیل کن</button>
                <button onclick="addNewSet()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
            
            <div id="convertResult" class="conversion-result" style="display: none;"></div>
        </div>
    `;
    
    // نمایش div نتیجه بعد از کلیک روی تبدیل
    const originalConvertFunc = window[convertFunctions[conversionType].replace('()', '')];
    if (originalConvertFunc) {
        const originalFuncName = convertFunctions[conversionType].replace('()', '');
        window[originalFuncName] = function() {
            const resultDiv = document.getElementById('convertResult');
            if (resultDiv) resultDiv.style.display = 'block';
            originalConvertFunc();
        };
    }
}

function fillConvertExample(example) {
    const input = document.getElementById('convertInput');
    if (input) {
        input.value = example;
    }
}

// ========== پایان توابع تبدیل ==========

// توابع UI
function showMainMenu() {
    const stepElement = document.getElementById("step");
    if (!stepElement) return;
    
    stepElement.innerHTML = `
        <div class="step-container">
            <h3>منوی اصلی آزمایشگاه مجموعه‌ها</h3>
            <p>تعداد مجموعه‌های موجود: <strong>${AppState.sets.size}</strong></p>
            <p>لطفاً عملیات مورد نظر را انتخاب کنید:</p>
            <div class="operations-grid">
                <button onclick="addNewSet()" class="btn-operation">➕ ایجاد مجموعه جدید</button>
                <button onclick="showAllSets()" class="btn-operation">📋 نمایش همه مجموعه‌ها</button>
                <button onclick="showSetOperations()" class="btn-operation">🧮 عملیات روی مجموعه‌ها</button>
                <button onclick="checkMembership()" class="btn-operation">🔍 بررسی عضویت</button>
                <button onclick="checkSubsets()" class="btn-operation">📊 بررسی زیرمجموعه‌ها</button>
                <button onclick="showUniversalSets()" class="btn-operation">🌍 مجموعه‌های جهانی</button>
                <button onclick="showVisualizations()" class="btn-operation">📈 نمایش گرافیکی</button>
                <button onclick="showSearch()" class="btn-operation">🔎 جستجو در مجموعه‌ها</button>
            </div>
            
            <div class="quick-actions">
                <button onclick="quickCreateSet('اعداد فرد ۱ تا ۹', [1,3,5,7,9])" class="btn btn-info">اعداد فرد ۱-۹</button>
                <button onclick="quickCreateSet('اعداد زوج ۲ تا ۱۰', [2,4,6,8,10])" class="btn btn-info">اعداد زوج ۲-۱۰</button>
                <button onclick="quickCreateSet('اعداد -۲ تا ۲', [-2,-1,0,1,2])" class="btn btn-info">اعداد -۲ تا ۲</button>
                <button onclick="quickCreateSet('اعداد اول کوچک', [2,3,5,7,11])" class="btn btn-info">اعداد اول کوچک</button>
            </div>
        </div>
    `;
}

// نمایش گرافیکی مجموعه‌ها
function showVisualizations() {
    if (AppState.sets.size === 0) {
        showMessage('برای نمایش گرافیکی حداقل به یک مجموعه نیاز دارید', 'warning');
        return;
    }

    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>📊 نمایش گرافیکی مجموعه‌ها</h3>
            <p>تعداد مجموعه‌های موجود: <strong>${AppState.sets.size}</strong></p>
            <p>نوع نمایش گرافیکی را انتخاب کنید:</p>
            
            <div class="visualization-options">
                <div class="viz-option" onclick="showVennDiagram()">
                    <div class="viz-icon">🔵</div>
                    <div class="viz-title">نمودار ون</div>
                    <div class="viz-desc">نمایش روابط بین ۲ یا ۳ مجموعه</div>
                </div>
                
                <div class="viz-option" onclick="showNumberLine()">
                    <div class="viz-icon">📏</div>
                    <div class="viz-title">محور اعداد</div>
                    <div class="viz-desc">نمایش مجموعه‌های عددی روی محور</div>
                </div>
                
                <div class="viz-option" onclick="showCardinalityChart()">
                    <div class="viz-icon">📈</div>
                    <div class="viz-title">نمودار اندازه‌ها</div>
                    <div class="viz-desc">مقایسه تعداد اعضای مجموعه‌ها</div>
                </div>
            </div>
            
            <div class="button-group">
                <button onclick="showMainMenu()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

// نمایش نمودار ون
function showVennDiagram() {
    if (AppState.sets.size < 2) {
        showMessage('برای نمایش نمودار ون حداقل به ۲ مجموعه نیاز دارید', 'warning');
        return;
    }

    const setNames = Array.from(AppState.sets.keys()).slice(0, 3);
    const setsData = setNames.map(name => AppState.sets.get(name));
    
    const intersections = {
        'A∩B': intersection(setsData[0].elements, setsData[1].elements),
        'A∩C': setsData[2] ? intersection(setsData[0].elements, setsData[2].elements) : [],
        'B∩C': setsData[2] ? intersection(setsData[1].elements, setsData[2].elements) : [],
        'A∩B∩C': setsData[2] ? intersection(intersection(setsData[0].elements, setsData[1].elements), setsData[2].elements) : []
    };

    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>🔵 نمودار ون تعاملی</h3>
            <p>نمایش روابط بین مجموعه‌ها:</p>
            
            <div class="venn-diagram">
                <div class="venn-container">
                    <div class="venn-circle A" style="background: #4c8bff;"></div>
                    <div class="venn-circle B" style="background: #28a745;"></div>
                    ${setsData[2] ? '<div class="venn-circle C" style="background: #ffc107;"></div>' : ''}
                    
                    <div class="venn-label A">${setNames[0]}</div>
                    <div class="venn-label B">${setNames[1]}</div>
                    ${setsData[2] ? `<div class="venn-label C">${setNames[2]}</div>` : ''}
                </div>
                
                <div class="venn-elements">
                    <h4>عناصر مناطق:</h4>
                    <p><strong>فقط ${setNames[0]}:</strong> ${formatSet(difference(setsData[0].elements, setsData[1].elements))}</p>
                    <p><strong>فقط ${setNames[1]}:</strong> ${formatSet(difference(setsData[1].elements, setsData[0].elements))}</p>
                    <p><strong>${setNames[0]} ∩ ${setNames[1]}:</strong> ${formatSet(intersections['A∩B'])}</p>
                    ${setsData[2] ? `
                        <p><strong>فقط ${setNames[2]}:</strong> ${formatSet(difference(setsData[2].elements, union(setsData[0].elements, setsData[1].elements)))}</p>
                        <p><strong>${setNames[0]} ∩ ${setNames[2]}:</strong> ${formatSet(intersections['A∩C'])}</p>
                        <p><strong>${setNames[1]} ∩ ${setNames[2]}:</strong> ${formatSet(intersections['B∩C'])}</p>
                        <p><strong>${setNames[0]} ∩ ${setNames[1]} ∩ ${setNames[2]}:</strong> ${formatSet(intersections['A∩B∩C'])}</p>
                    ` : ''}
                </div>
            </div>
            
            <div class="button-group">
                <button onclick="showVisualizations()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

// نمایش محور اعداد
function showNumberLine() {
    if (AppState.sets.size === 0) {
        showMessage('ابتدا باید مجموعه‌ای ایجاد کنید', 'warning');
        return;
    }

    const selectedSet = Array.from(AppState.sets.keys())[0];
    const setData = AppState.sets.get(selectedSet);
    const elements = setData.elements.filter(x => typeof x === 'number' && !isNaN(x));
    
    if (elements.length === 0) {
        showMessage('این مجموعه شامل اعداد نیست', 'warning');
        return;
    }

    const min = Math.min(...elements);
    const max = Math.max(...elements);
    const range = max - min || 1;

    let marksHTML = '';
    let numbersHTML = '';
    let pointsHTML = '';

    for (let i = Math.floor(min); i <= Math.ceil(max); i++) {
        const position = ((i - min) / range) * 100;
        if (position >= 0 && position <= 100) {
            marksHTML += `<div class="line-mark" style="left: ${position}%;"></div>`;
            numbersHTML += `<div class="line-number" style="left: ${position}%;">${i}</div>`;
        }
    }

    elements.forEach(element => {
        const position = ((element - min) / range) * 100;
        pointsHTML += `<div class="set-point" style="left: ${position}%; background: var(--primary-color);"></div>`;
    });

    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>📏 محور اعداد - مجموعه ${selectedSet}</h3>
            
            <div class="number-line">
                <div class="line-container">
                    <div class="line"></div>
                    ${marksHTML}
                    ${numbersHTML}
                    ${pointsHTML}
                </div>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
                <p><strong>مجموعه:</strong> ${formatSet(elements)}</p>
                <p><strong>دامنه:</strong> از ${min} تا ${max}</p>
            </div>
            
            <div class="button-group">
                <button onclick="showVisualizations()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

// نمایش نمودار کاردینالیتی
function showCardinalityChart() {
    if (AppState.sets.size === 0) {
        showMessage('ابتدا باید مجموعه‌ای ایجاد کنید', 'warning');
        return;
    }

    let chartHTML = '';
    const setsArray = Array.from(AppState.sets.entries());
    
    const validSets = setsArray.filter(([, data]) => 
        Array.isArray(data.elements) && data.elements.length > 0
    );
    
    if (validSets.length === 0) {
        showMessage('هیچ مجموعه‌ای با عضو عددی وجود ندارد', 'warning');
        return;
    }
    
    const maxElements = Math.max(...validSets.map(([, data]) => data.elements.length));
    
    validSets.forEach(([name, setData], index) => {
        const height = (setData.elements.length / maxElements) * 100;
        chartHTML += `
            <div class="chart-bar" style="height: ${height}%;">
                <div class="chart-value">${setData.elements.length}</div>
                <div class="chart-label">${name}</div>
            </div>
        `;
    });

    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>📈 نمودار اندازه مجموعه‌ها</h3>
            
            <div class="cardinality-chart">
                <div class="chart-container">
                    ${chartHTML}
                </div>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
                <p>تعداد اعضای هر مجموعه به صورت بصری نمایش داده شده است.</p>
            </div>
            
            <div class="button-group">
                <button onclick="showVisualizations()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

// نمایش مجموعه‌ها
function showAllSets() {
    if (AppState.sets.size === 0) {
        document.getElementById("step").innerHTML = `
            <div class="step-container">
                <h3>مجموعه‌های موجود</h3>
                <p>هنوز هیچ مجموعه‌ای ایجاد نشده است.</p>
                <div class="quick-actions">
                    <button onclick="quickCreateSet('اعداد فرد ۱ تا ۹', [1,3,5,7,9])" class="btn btn-info">اعداد فرد ۱-۹</button>
                    <button onclick="quickCreateSet('اعداد زوج ۲ تا ۱۰', [2,4,6,8,10])" class="btn btn-info">اعداد زوج ۲-۱۰</button>
                    <button onclick="quickCreateSet('اعداد -۲ تا ۲', [-2,-1,0,1,2])" class="btn btn-info">اعداد -۲ تا ۲</button>
                </div>
                <button onclick="addNewSet()" class="btn btn-primary">➕ ایجاد مجموعه جدید</button>
                <button onclick="showMainMenu()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        `;
        return;
    }
    
    let setsHTML = '<div class="step-container"><h3>مجموعه‌های موجود</h3>';
    setsHTML += `<p>تعداد مجموعه‌ها: <strong>${AppState.sets.size}</strong></p>`;
    
    AppState.sets.forEach((setData, name) => {
        const elements = setData.elements || [];
        let content = '';
        
        if (setData.type === 'symbolic') {
            content = `
                <div class="set-expression">${setData.expression}</div>
                <div class="set-content">مقادیر: ${formatSet(elements)}</div>
            `;
        } else if (setData.type === 'verbal') {
            content = `
                <div class="set-description">${setData.description}</div>
                <div class="set-content">مقادیر: ${formatSet(elements)}</div>
            `;
        } else {
            content = `<div class="set-content">${formatSet(elements)}</div>`;
        }
        
        let infiniteWarning = '';
        const infiniteSets = ['ℚ', 'ℝ', 'ℚ′', 'گویا', 'حقیقی', 'گنگ'];
        if (infiniteSets.includes(name)) {
            infiniteWarning = '<p style="color: #856404; background: #fff3cd; padding: 10px; border-radius: 8px; margin-top: 10px; font-size: 0.9rem;">⚠️ این مجموعه نامتناهی است. فقط یک زیرمجموعه نمونه نمایش داده شده است.</p>';
        }
        
        setsHTML += `
            <div class="set-item">
                <div class="set-name">${name} <small>(${getTypeName(setData.type)})</small></div>
                ${content}
                ${infiniteWarning}
                <div class="set-actions">
                    <button onclick="editSet('${name}')" class="btn btn-info">✏️ ویرایش</button>
                    <button onclick="deleteSet('${name}')" class="btn btn-danger">🗑️ حذف</button>
                    <button onclick="showSetDetails('${name}')" class="btn btn-secondary">📊 جزئیات</button>
                </div>
            </div>
        `;
    });
    
    setsHTML += `
        <div class="button-group">
            <button onclick="addNewSet()" class="btn btn-success">➕ مجموعه جدید</button>
            <button onclick="showMainMenu()" class="btn btn-secondary">🔙 بازگشت</button>
        </div>
    </div>`;
    
    document.getElementById("step").innerHTML = setsHTML;
}

// ایجاد مجموعه جدید
function addNewSet() {
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>ایجاد مجموعه جدید</h3>
            <p>تعداد مجموعه‌های موجود: <strong>${AppState.sets.size}</strong></p>
            <p>لطفاً نوع ورودی مجموعه را انتخاب کنید:</p>
            
            <div class="input-type-selector">
                <button onclick="showSymbolicInput()" class="btn-type">
                    <strong>روش نمادین</strong><br>
                    <small>مثال: { x | x ∈ ℕ , 3 ≤ x ≤ 8 }</small>
                </button>
                
                <button onclick="showVerbalInput()" class="btn-type">
                    <strong>حالت کلامی</strong><br>
                    <small>مثال: اعداد فرد بین ۱ تا ۱۰</small>
                </button>
                
                <button onclick="showNormalInput()" class="btn-type">
                    <strong>حالت مستقیم</strong><br>
                    <small>مثال: 1,2,3,4,5</small>
                </button>
            </div>
            
            <h4 style="margin-top: 30px; color: #6f42c1;">🔄 تبدیل فرمت‌ها:</h4>
            <div class="input-type-selector">
                <button onclick="showConversionPage('normalToSymbolic')" class="btn-convert">
                    <strong>عادی → نمادین</strong><br>
                    <small>مثال: 1,3,5,7,9 → { x | x ∈ ℕ, 1 ≤ x ≤ 9, x فرد }</small>
                </button>
                
                <button onclick="showConversionPage('normalToVerbal')" class="btn-convert">
                    <strong>عادی → کلامی</strong><br>
                    <small>مثال: 1,3,5,7,9 → اعداد فرد بین ۱ تا ۹</small>
                </button>
                
                <button onclick="showConversionPage('verbalToSymbolic')" class="btn-convert">
                    <strong>کلامی → نمادین</strong><br>
                    <small>مثال: اعداد فرد بین ۱ تا ۱۰ → { x | x ∈ ℕ, 1 ≤ x ≤ 9, x فرد }</small>
                </button>
                
                <button onclick="showConversionPage('symbolicToVerbal')" class="btn-convert">
                    <strong>نمادین → کلامی</strong><br>
                    <small>مثال: { x | x ∈ ℤ, -4 < x < 5 } → اعداد صحیح بین -۳ تا ۴</small>
                </button>
            </div>
            
            <div class="button-group">
                <button onclick="showMainMenu()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

// نمایش ورودی نمادین
function showSymbolicInput() {
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>ایجاد مجموعه با روش نمادین</h3>
            <p>عبارت نمادین مجموعه را وارد کنید:</p>
            
            <div class="form-group">
                <label class="form-label">نام مجموعه:</label>
                <input type="text" id="setName" class="form-input" placeholder="مثال: مجموعه A">
            </div>
            
            <div class="form-group">
                <label class="form-label">عبارت نمادین:</label>
                <input type="text" id="symbolicExpression" class="form-input" 
                       placeholder="مثال: { x | x ∈ ℤ , 2 < x < 20 } یا {1,2,3,4,5}">
                <small style="color: #666; display: block; margin-top: 5px;">
                    💡 از کیبورد ریاضی (⌨️) برای تایپ نمادها استفاده کنید
                </small>
            </div>
            
            <div class="examples">
                <strong>📝 نمونه‌های آماده (کلیک کنید):</strong>
                <div class="example-buttons">
                    <button onclick="fillSymbolicExample('{ x | x ∈ ℤ , 2 < x < 20 }')" class="btn-example">
                        { x | x ∈ ℤ , 2 < x < 20 } → اعداد صحیح بین ۲ و ۲۰
                    </button>
                    <button onclick="fillSymbolicExample('{1,2,3,4,5}')" class="btn-example">
                        {1,2,3,4,5} → مجموعه اعداد ۱ تا ۵
                    </button>
                    <button onclick="fillSymbolicExample('{ x | x ∈ ℕ , x ≤ 10 }')" class="btn-example">
                        { x | x ∈ ℕ , x ≤ 10 } → اعداد طبیعی کوچکتر مساوی ۱۰
                    </button>
                    <button onclick="fillSymbolicExample('اعداد فرد بین ۱ تا ۱۰')" class="btn-example">
                        اعداد فرد بین ۱ تا ۱۰ → {1,3,5,7,9}
                    </button>
                </div>
            </div>

            <div class="quick-actions">
                <button onclick="testSymbolicParser()" class="btn btn-warning">🧪 تست تجزیه‌کننده</button>
                <button onclick="showLivePreview()" class="btn btn-info">👁️ پیش‌نمایش زنده</button>
            </div>

            <div id="previewContainer" style="display: none;">
                <div class="set-details">
                    <h4>👁️ پیش‌نمایش مجموعه:</h4>
                    <div id="livePreview"></div>
                </div>
            </div>
            
            <div class="button-group">
                <button onclick="createSymbolicSet()" class="btn btn-success">✅ ایجاد مجموعه</button>
                <button onclick="addNewSet()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;

    const expressionInput = document.getElementById('symbolicExpression');
    expressionInput.addEventListener('input', debounce(showLivePreview, 500));
}

function showLivePreview() {
    const expression = document.getElementById('symbolicExpression').value.trim();
    const previewContainer = document.getElementById('previewContainer');
    const livePreview = document.getElementById('livePreview');
    
    if (!expression) {
        previewContainer.style.display = 'none';
        return;
    }
    
    try {
        const elements = parseSymbolicExpression(expression);
        livePreview.innerHTML = `
            <p><strong>عناصر مجموعه:</strong> ${formatSet(elements)}</p>
            <p><strong>تعداد اعضا:</strong> ${elements.length}</p>
            <p><strong>نمایش عددی:</strong> [${elements.join(', ')}]</p>
        `;
        previewContainer.style.display = 'block';
    } catch (error) {
        livePreview.innerHTML = `
            <p style="color: var(--danger-color);"><strong>خطا:</strong> ${error.message}</p>
            <p style="color: var(--warning-color); font-size: 14px; margin-top: 10px;">
                💡 پیشنهاد: از فرمت‌های ساده‌تر مانند "اعداد فرد بین ۱ تا ۱۰" یا "{1,2,3,4,5}" استفاده کنید
            </p>
        `;
        previewContainer.style.display = 'block';
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function testSymbolicParser() {
    const expression = document.getElementById('symbolicExpression').value.trim();
    if (!expression) {
        showMessage('لطفاً یک عبارت وارد کنید', 'warning');
        return;
    }

    try {
        const result = parseSymbolicExpression(expression);
        showMessage(`✅ تست موفق! مجموعه ایجاد شده: ${formatSet(result)}`, 'success', 5000);
    } catch (error) {
        showMessage(`❌ خطا در تجزیه: ${error.message}`, 'error', 5000);
    }
}

function createSymbolicSet() {
    const name = document.getElementById('setName').value.trim();
    const expression = document.getElementById('symbolicExpression').value.trim();
    
    if (!name) {
        showMessage('لطفاً نام مجموعه را وارد کنید', 'error');
        return;
    }
    
    if (!expression) {
        showMessage('لطفاً عبارت نمادین را وارد کنید', 'error');
        return;
    }
    
    if (AppState.sets.has(name)) {
        showMessage(`مجموعه "${name}" از قبل وجود دارد`, 'warning');
        return;
    }
    
    try {
        const elements = parseSymbolicExpression(expression);
        
        AppState.sets.set(name, {
            type: 'symbolic',
            elements: elements,
            expression: expression,
            createdAt: new Date().toISOString()
        });
        
        HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());
        StorageManager.saveState();
        updateStats();
        showMessage(`✅ مجموعه "${name}" ایجاد شد: ${formatSet(elements)}`, 'success');
        showAllSets();
    } catch (error) {
        showMessage(`❌ خطا در ایجاد مجموعه: ${error.message}`, 'error');
    }
}

function showVerbalInput() {
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>ایجاد مجموعه با توصیف کلامی</h3>
            <p>توصیف مجموعه را به زبان فارسی وارد کنید:</p>
            
            <div class="form-group">
                <label class="form-label">نام مجموعه:</label>
                <input type="text" id="setName" class="form-input" placeholder="مثال: اعداد فرد">
            </div>
            
            <div class="form-group">
                <label class="form-label">توصیف مجموعه:</label>
                <input type="text" id="verbalDescription" class="form-input" 
                       placeholder="مثال: اعداد فرد بین ۱ تا ۱۰">
            </div>
            
            <div class="examples">
                <strong>📝 نمونه‌های آماده:</strong>
                <div class="example-buttons">
                    <button onclick="fillVerbalExample('اعداد فرد بین ۱ تا ۹')" class="btn-example">
                        اعداد فرد بین ۱ تا ۹ → {1,3,5,7,9}
                    </button>
                    <button onclick="fillVerbalExample('اعداد زوج بین ۲ تا ۱۰')" class="btn-example">
                        اعداد زوج بین ۲ تا ۱۰ → {2,4,6,8,10}
                    </button>
                    <button onclick="fillVerbalExample('اعداد اول کوچکتر از ۱۵')" class="btn-example">
                        اعداد اول کوچکتر از ۱۵ → {2,3,5,7,11,13}
                    </button>
                    <button onclick="fillVerbalExample('اعداد صحیح بین -۳ تا ۳')" class="btn-example">
                        اعداد صحیح بین -۳ تا ۳ → {-3,-2,-1,0,1,2,3}
                    </button>
                </div>
            </div>
            
            <div class="button-group">
                <button onclick="createVerbalSet()" class="btn btn-success">✅ ایجاد مجموعه</button>
                <button onclick="addNewSet()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

function createVerbalSet() {
    const name = document.getElementById('setName').value.trim();
    const description = document.getElementById('verbalDescription').value.trim();
    
    if (!name) {
        showMessage('لطفاً نام مجموعه را وارد کنید', 'error');
        return;
    }
    
    if (!description) {
        showMessage('لطفاً توصیف مجموعه را وارد کنید', 'error');
        return;
    }
    
    if (AppState.sets.has(name)) {
        showMessage(`مجموعه "${name}" از قبل وجود دارد`, 'warning');
        return;
    }
    
    try {
        const elements = parseVerbalDescription(description);
        
        AppState.sets.set(name, {
            type: 'verbal',
            elements: elements,
            description: description,
            createdAt: new Date().toISOString()
        });
        
        HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());
        StorageManager.saveState();
        updateStats();
        showMessage(`✅ مجموعه "${name}" ایجاد شد: ${formatSet(elements)}`, 'success');
        showAllSets();
    } catch (error) {
        showMessage(`❌ خطا در ایجاد مجموعه: ${error.message}`, 'error');
    }
}

function showNormalInput() {
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>ایجاد مجموعه با مقادیر مستقیم</h3>
            <p>اعضای مجموعه را وارد کنید (با کاما جدا کنید):</p>
            
            <div class="form-group">
                <label class="form-label">نام مجموعه:</label>
                <input type="text" id="setName" class="form-input" placeholder="مثال: مجموعه نمونه">
            </div>
            
            <div class="form-group">
                <label class="form-label">اعضای مجموعه:</label>
                <input type="text" id="setElements" class="form-input" 
                       placeholder="مثال: 1,2,3,4,5 یا a,b,c,d">
            </div>
            
            <div class="examples">
                <strong>📝 نمونه‌های آماده:</strong>
                <div class="example-buttons">
                    <button onclick="fillNormalExample('1,2,3,4,5')" class="btn-example">
                        1,2,3,4,5 → {1,2,3,4,5}
                    </button>
                    <button onclick="fillNormalExample('a,b,c,d,e')" class="btn-example">
                        a,b,c,d,e → {a,b,c,d,e}
                    </button>
                    <button onclick="fillNormalExample('-2,-1,0,1,2')" class="btn-example">
                        -2,-1,0,1,2 → {-2,-1,0,1,2}
                    </button>
                    <button onclick="fillNormalExample('2,3,5,7,11,13')" class="btn-example">
                        2,3,5,7,11,13 → {2,3,5,7,11,13}
                    </button>
                </div>
            </div>
            
            <div class="button-group">
                <button onclick="createNormalSet()" class="btn btn-success">✅ ایجاد مجموعه</button>
                <button onclick="addNewSet()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

function createNormalSet() {
    const name = document.getElementById('setName').value.trim();
    const elementsInput = document.getElementById('setElements').value.trim();
    
    if (!name) {
        showMessage('لطفاً نام مجموعه را وارد کنید', 'error');
        return;
    }
    
    if (!elementsInput) {
        showMessage('لطفاً اعضای مجموعه را وارد کنید', 'error');
        return;
    }
    
    if (AppState.sets.has(name)) {
        showMessage(`مجموعه "${name}" از قبل وجود دارد`, 'warning');
        return;
    }
    
    const elements = parseSet(elementsInput);
    
    AppState.sets.set(name, {
        type: 'normal',
        elements: elements,
        createdAt: new Date().toISOString()
    });
    
    HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());
    StorageManager.saveState();
    updateStats();
    showMessage(`✅ مجموعه "${name}" ایجاد شد: ${formatSet(elements)}`, 'success');
    showAllSets();
}

function fillSymbolicExample(example) {
    document.getElementById('symbolicExpression').value = example;
    showLivePreview();
}

function fillVerbalExample(example) {
    document.getElementById('verbalDescription').value = example;
}

function fillNormalExample(example) {
    document.getElementById('setElements').value = example;
}

function editSet(name) {
    const setData = AppState.sets.get(name);
    if (!setData) return;
    
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>✏️ ویرایش مجموعه ${name}</h3>
            
            <div class="form-group">
                <label class="form-label">نام جدید مجموعه:</label>
                <input type="text" id="newSetName" class="form-input" value="${name}">
            </div>
            
            <div class="form-group">
                <label class="form-label">اعضای مجموعه (با کاما جدا کنید):</label>
                <input type="text" id="newSetElements" class="form-input" 
                       value="${setData.elements.join(', ')}">
            </div>
            
            <div class="button-group">
                <button onclick="updateSet('${name}')" class="btn btn-success">💾 ذخیره تغییرات</button>
                <button onclick="showAllSets()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

function updateSet(oldName) {
    const newName = document.getElementById('newSetName').value.trim();
    const elementsInput = document.getElementById('newSetElements').value.trim();
    
    if (!newName) {
        showMessage('لطفاً نام مجموعه را وارد کنید', 'error');
        return;
    }
    
    if (!elementsInput) {
        showMessage('لطفاً اعضای مجموعه را وارد کنید', 'error');
        return;
    }
    
    const elements = parseSet(elementsInput);
    
    if (newName !== oldName) {
        AppState.sets.delete(oldName);
    }
    
    AppState.sets.set(newName, {
        type: 'normal',
        elements: elements,
        createdAt: new Date().toISOString()
    });
    
    HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());
    StorageManager.saveState();
    updateStats();
    showMessage(`✅ مجموعه "${newName}" به‌روزرسانی شد`, 'success');
    showAllSets();
}

function deleteSet(name) {
    if (confirm(`آیا از حذف مجموعه "${name}" مطمئن هستید؟`)) {
        AppState.sets.delete(name);
        HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());
        StorageManager.saveState();
        updateStats();
        showMessage(`✅ مجموعه "${name}" حذف شد`, 'success');
        showAllSets();
    }
}

function showSetDetails(name) {
    const setData = AppState.sets.get(name);
    if (!setData) return;
    
    let infiniteWarning = '';
    if (AppState.infiniteSetsInfo && AppState.infiniteSetsInfo[name]) {
        infiniteWarning = `<p style="color: #856404; background: #fff3cd; padding: 10px; border-radius: 8px; margin: 12px 0;">${AppState.infiniteSetsInfo[name]}</p>`;
    }
    
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>📊 جزئیات مجموعه ${name}</h3>
            
            <div class="set-details">
                <p><strong>نوع:</strong> ${getTypeName(setData.type)}</p>
                <p><strong>تعداد اعضا:</strong> ${setData.elements.length}</p>
                <p><strong>اعضا:</strong> ${formatSet(setData.elements)}</p>
                ${setData.expression ? `<p><strong>عبارت نمادین:</strong> ${setData.expression}</p>` : ''}
                ${setData.description ? `<p><strong>توصیف:</strong> ${setData.description}</p>` : ''}
                ${setData.operation ? `<p><strong>عملیات:</strong> ${setData.operation}</p>` : ''}
                ${infiniteWarning}
                <p><strong>زمان ایجاد:</strong> ${new Date(setData.createdAt).toLocaleString('fa-IR')}</p>
            </div>
            
            <div class="button-group">
                <button onclick="showAllSets()" class="btn btn-secondary">🔙 بازگشت به لیست</button>
            </div>
        </div>
    `;
}

function undoLastAction() {
    const state = HistoryManager.undo();
    if (state) {
        updateStats();
        showMessage('عملیات قبلی بازگردانی شد', 'success');
    } else {
        showMessage('هیچ عملیاتی برای بازگشت وجود ندارد', 'warning');
    }
}

function redoLastAction() {
    const state = HistoryManager.redo();
    if (state) {
        updateStats();
        showMessage('عملیات دوباره انجام شد', 'success');
    } else {
        showMessage('هیچ عملیاتی برای تکرار وجود ندارد', 'warning');
    }
}

function clearAllSets() {
    if (AppState.sets.size === 0) {
        showMessage('هیچ مجموعه‌ای برای پاک کردن وجود ندارد', 'warning');
        return;
    }
    
    if (confirm(`آیا از پاک کردن تمام ${AppState.sets.size} مجموعه مطمئن هستید؟`)) {
        AppState.sets.clear();
        AppState.nextSetId = 1;
        HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());
        StorageManager.saveState();
        updateStats();
        showMessage('✅ تمام مجموعه‌ها پاک شدند', 'success');
        showMainMenu();
    }
}

function start() {
    AppState.sets.clear();
    AppState.nextSetId = 1;
    HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());
    StorageManager.saveState();
    updateStats();
    showMessage('برنامه از نو شروع شد', 'success');
    showMainMenu();
}

function debugAppState() {
    console.log('🐛 وضعیت برنامه:', {
        sets: Array.from(AppState.sets.entries()),
        history: HistoryManager.history,
        currentHistoryIndex: HistoryManager.currentIndex
    });
    
    showMessage('اطلاعات دیباگ در کنسول نمایش داده شد', 'info', 3000);
}

function showHelp() {
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>📚 راهنمای کامل آزمایشگاه مجموعه‌ها</h3>
            
            <div class="help-content">
                <div class="help-section">
                    <h4>🎯 نحوه استفاده:</h4>
                    <ul>
                        <li>برای ایجاد مجموعه جدید از منوی اصلی استفاده کنید</li>
                        <li>سه روش برای ایجاد مجموعه دارید: نمادین، کلامی و مستقیم</li>
                        <li>از دکمه‌های سریع برای ایجاد مجموعه‌های نمونه استفاده کنید</li>
                        <li>برای عملیات روی مجموعه‌ها حداقل به ۲ مجموعه نیاز دارید</li>
                    </ul>
                </div>

                <div class="help-section">
                    <h4>🔄 تبدیل فرمت‌ها:</h4>
                    <ul>
                        <li><strong>عادی → نمادین</strong>: تبدیل لیست اعداد به فرمت {x | x ∈ ...}</li>
                        <li><strong>عادی → کلامی</strong>: تبدیل لیست اعداد به توصیف فارسی</li>
                        <li><strong>کلامی → نمادین</strong>: تبدیل توصیف فارسی به فرمت نمادین</li>
                        <li><strong>نمادین → کلامی</strong>: تبدیل فرمت نمادین به توصیف فارسی</li>
                    </ul>
                </div>

                <div class="help-section">
                    <h4>🔧 عملیات موجود:</h4>
                    <ul>
                        <li><strong>اتحاد (A ∪ B)</strong>: همه عناصر دو مجموعه</li>
                        <li><strong>اشتراک (A ∩ B)</strong>: عناصر مشترک دو مجموعه</li>
                        <li><strong>تفاضل (A - B)</strong>: عناصر A که در B نیستند</li>
                        <li><strong>تفاضل متقارن (A Δ B)</strong>: عناصری که فقط در یکی از مجموعه‌ها هستند</li>
                        <li><strong>بررسی عضویت</strong>: آیا عنصر در مجموعه است؟</li>
                        <li><strong>بررسی زیرمجموعه</strong>: آیا مجموعه A زیرمجموعه B است؟</li>
                    </ul>
                </div>

                <div class="help-section">
                    <h4>📊 نمایش‌های گرافیکی:</h4>
                    <ul>
                        <li><strong>نمودار ون</strong>: نمایش روابط بین ۲ یا ۳ مجموعه</li>
                        <li><strong>محور اعداد</strong>: نمایش مجموعه‌های عددی روی محور</li>
                        <li><strong>نمودار اندازه‌ها</strong>: مقایسه تعداد اعضای مجموعه‌ها</li>
                    </ul>
                </div>

                <div class="help-section">
                    <h4>🎪 فرمت‌های ورودی پشتیبانی شده:</h4>
                    <ul>
                        <li><strong>نمادین</strong>: {x | x ∈ ℕ, x ≤ 5} یا {1,2,3,4,5}</li>
                        <li><strong>کلامی</strong>: اعداد فرد بین ۱ تا ۱۰ یا اعداد اول کوچکتر از ۱۵</li>
                        <li><strong>مستقیم</strong>: 1,2,3,4,5 یا a,b,c,d,e</li>
                    </ul>
                </div>
            </div>
            
            <div class="button-group">
                <button onclick="showMainMenu()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

// توابع عملیات مجموعه‌ای، جستجو، مجموعه‌های جهانی
function showSetOperations() {
    if (AppState.sets.size < 2) {
        showMessage('برای انجام عملیات حداقل به ۲ مجموعه نیاز دارید', 'warning');
        return;
    }

    const setNames = Array.from(AppState.sets.keys());
    
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>🧮 عملیات روی مجموعه‌ها</h3>
            <p>تعداد مجموعه‌های موجود: <strong>${AppState.sets.size}</strong></p>
            <p>لطفاً عملیات مورد نظر را انتخاب کنید:</p>
            
            <div class="operations-grid">
                <button onclick="showBinaryOperation('union')" class="btn-operation">
                    <span style="font-size: 24px;">∪</span><br>اتحاد مجموعه‌ها
                </button>
                <button onclick="showBinaryOperation('intersection')" class="btn-operation">
                    <span style="font-size: 24px;">∩</span><br>اشتراک مجموعه‌ها
                </button>
                <button onclick="showBinaryOperation('difference')" class="btn-operation">
                    <span style="font-size: 24px;">−</span><br>تفاضل مجموعه‌ها
                </button>
                <button onclick="showBinaryOperation('symmetricDifference')" class="btn-operation">
                    <span style="font-size: 24px;">Δ</span><br>تفاضل متقارن
                </button>
            </div>
            
            <div class="button-group">
                <button onclick="showMainMenu()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

function showBinaryOperation(operation) {
    const setNames = Array.from(AppState.sets.keys());
    const operationNames = {
        'union': 'اتحاد',
        'intersection': 'اشتراک', 
        'difference': 'تفاضل',
        'symmetricDifference': 'تفاضل متقارن'
    };
    
    let operationSymbol = '';
    switch(operation) {
        case 'union': operationSymbol = '∪'; break;
        case 'intersection': operationSymbol = '∩'; break;
        case 'difference': operationSymbol = '−'; break;
        case 'symmetricDifference': operationSymbol = 'Δ'; break;
    }

    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>${operationSymbol} ${operationNames[operation]} مجموعه‌ها</h3>
            <p>لطفاً دو مجموعه را انتخاب کنید:</p>
            
            <div class="form-group">
                <label class="form-label">مجموعه اول:</label>
                <select id="setA" class="form-input">
                    ${setNames.map(name => `<option value="${name}">${name}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">مجموعه دوم:</label>
                <select id="setB" class="form-input">
                    ${setNames.map(name => `<option value="${name}">${name}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">نام مجموعه نتیجه (اختیاری):</label>
                <input type="text" id="resultName" class="form-input" placeholder="مثال: نتیجه اتحاد">
            </div>
            
            <div class="button-group">
                <button onclick="performBinaryOperation('${operation}')" class="btn btn-success">🔍 انجام عملیات</button>
                <button onclick="showSetOperations()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

function performBinaryOperation(operation) {
    const setNameA = document.getElementById('setA').value;
    const setNameB = document.getElementById('setB').value;
    const resultName = document.getElementById('resultName').value.trim() || 
                      `نتیجه_${operation}_${setNameA}_${setNameB}`;
    
    const setA = AppState.sets.get(setNameA);
    const setB = AppState.sets.get(setNameB);
    
    if (!setA || !setB) {
        showMessage('مجموعه‌های انتخاب شده معتبر نیستند', 'error');
        return;
    }
    
    let resultElements = [];
    let operationSymbol = '';
    let operationName = '';
    
    switch(operation) {
        case 'union':
            resultElements = union(setA.elements, setB.elements);
            operationSymbol = '∪';
            operationName = 'اتحاد';
            break;
        case 'intersection':
            resultElements = intersection(setA.elements, setB.elements);
            operationSymbol = '∩';
            operationName = 'اشتراک';
            break;
        case 'difference':
            resultElements = difference(setA.elements, setB.elements);
            operationSymbol = '−';
            operationName = 'تفاضل';
            break;
        case 'symmetricDifference':
            resultElements = symmetricDifference(setA.elements, setB.elements);
            operationSymbol = 'Δ';
            operationName = 'تفاضل متقارن';
            break;
    }
    
    AppState.sets.set(resultName, {
        type: 'operation',
        elements: resultElements,
        operation: `${setNameA} ${operationSymbol} ${setNameB}`,
        createdAt: new Date().toISOString()
    });
    
    HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());
    StorageManager.saveState();
    updateStats();
    
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>✅ نتیجه ${operationName}</h3>
            
            <div class="set-details">
                <p><strong>عملیات:</strong> ${setNameA} ${operationSymbol} ${setNameB}</p>
                <p><strong>مجموعه ${setNameA}:</strong> ${formatSet(setA.elements)}</p>
                <p><strong>مجموعه ${setNameB}:</strong> ${formatSet(setB.elements)}</p>
                <p><strong>نتیجه:</strong> ${formatSet(resultElements)}</p>
                <p><strong>نام مجموعه نتیجه:</strong> ${resultName}</p>
            </div>
            
            <div class="button-group">
                <button onclick="showAllSets()" class="btn btn-success">📋 مشاهده همه مجموعه‌ها</button>
                <button onclick="showSetOperations()" class="btn btn-info">🧮 عملیات بیشتر</button>
                <button onclick="showMainMenu()" class="btn btn-secondary">🔙 منوی اصلی</button>
            </div>
        </div>
    `;
}

function checkMembership() {
    const setNames = Array.from(AppState.sets.keys());
    
    if (setNames.length === 0) {
        showMessage('ابتدا باید مجموعه‌ای ایجاد کنید', 'warning');
        return;
    }

    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>🔍 بررسی عضویت</h3>
            <p>عنصر و مجموعه مورد نظر را انتخاب کنید:</p>
            
            <div class="form-group">
                <label class="form-label">عنصر:</label>
                <input type="text" id="element" class="form-input" placeholder="مثال: 5 یا a">
            </div>
            
            <div class="form-group">
                <label class="form-label">مجموعه:</label>
                <select id="targetSet" class="form-input">
                    ${setNames.map(name => `<option value="${name}">${name}</option>`).join('')}
                </select>
            </div>
            
            <div class="button-group">
                <button onclick="checkElementMembership()" class="btn btn-success">🔍 بررسی عضویت</button>
                <button onclick="showMainMenu()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

function checkElementMembership() {
    const elementInput = document.getElementById('element').value.trim();
    const targetSetName = document.getElementById('targetSet').value;
    const targetSet = AppState.sets.get(targetSetName);
    
    if (!elementInput) {
        showMessage('لطفاً یک عنصر وارد کنید', 'error');
        return;
    }
    
    if (!targetSet) {
        showMessage('مجموعه انتخاب شده معتبر نیست', 'error');
        return;
    }
    
    let element = elementInput;
    const num = Number(elementInput);
    if (!isNaN(num) && elementInput.trim() !== '') {
        element = num;
    }
    
    const isMember = targetSet.elements.includes(element);
    const membershipSymbol = isMember ? '∈' : '∉';
    
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>${isMember ? '✅ عضو مجموعه است' : '❌ عضو مجموعه نیست'}</h3>
            
            <div class="set-details">
                <p><strong>عنصر:</strong> ${element}</p>
                <p><strong>مجموعه:</strong> ${targetSetName} = ${formatSet(targetSet.elements)}</p>
                <p><strong>نتیجه:</strong> ${element} ${membershipSymbol} ${targetSetName}</p>
            </div>
            
            <div class="button-group">
                <button onclick="checkMembership()" class="btn btn-info">🔍 بررسی دیگر</button>
                <button onclick="showMainMenu()" class="btn btn-secondary">🔙 منوی اصلی</button>
            </div>
        </div>
    `;
}

function checkSubsets() {
    const setNames = Array.from(AppState.sets.keys());
    
    if (setNames.length < 2) {
        showMessage('برای بررسی زیرمجموعه‌ها حداقل به ۲ مجموعه نیاز دارید', 'warning');
        return;
    }

    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>📊 بررسی زیرمجموعه‌ها</h3>
            <p>دو مجموعه را برای بررسی رابطه زیرمجموعه‌ای انتخاب کنید:</p>
            
            <div class="form-group">
                <label class="form-label">مجموعه اول (زیرمجموعه احتمالی):</label>
                <select id="subsetCandidate" class="form-input">
                    ${setNames.map(name => `<option value="${name}">${name}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">مجموعه دوم (مجموعه اصلی):</label>
                <select id="supersetCandidate" class="form-input">
                    ${setNames.map(name => `<option value="${name}">${name}</option>`).join('')}
                </select>
            </div>
            
            <div class="button-group">
                <button onclick="checkSubsetRelation()" class="btn btn-success">🔍 بررسی رابطه</button>
                <button onclick="showAllSubsets()" class="btn btn-info">📋 نمایش همه روابط</button>
                <button onclick="showMainMenu()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

function checkSubsetRelation() {
    const subsetName = document.getElementById('subsetCandidate').value;
    const supersetName = document.getElementById('supersetCandidate').value;
    
    const subset = AppState.sets.get(subsetName);
    const superset = AppState.sets.get(supersetName);
    
    if (!subset || !superset) {
        showMessage('مجموعه‌های انتخاب شده معتبر نیستند', 'error');
        return;
    }
    
    const isSubset = isSubsetOf(subset.elements, superset.elements);
    const isProperSubset = isSubset && subset.elements.length < superset.elements.length;
    const isEqual = JSON.stringify(subset.elements) === JSON.stringify(superset.elements);
    
    let relation = '';
    let relationSymbol = '';
    
    if (isEqual) {
        relation = 'برابر هستند';
        relationSymbol = '=';
    } else if (isProperSubset) {
        relation = 'زیرمجموعه سره است';
        relationSymbol = '⊂';
    } else if (isSubset) {
        relation = 'زیرمجموعه است';
        relationSymbol = '⊆';
    } else {
        relation = 'زیرمجموعه نیست';
        relationSymbol = '⊈';
    }
    
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>${isSubset ? '✅ زیرمجموعه است' : '❌ زیرمجموعه نیست'}</h3>
            
            <div class="set-details">
                <p><strong>مجموعه اول:</strong> ${subsetName} = ${formatSet(subset.elements)}</p>
                <p><strong>مجموعه دوم:</strong> ${supersetName} = ${formatSet(superset.elements)}</p>
                <p><strong>رابطه:</strong> ${subsetName} ${relationSymbol} ${supersetName}</p>
                <p><strong>توضیح:</strong> ${relation}</p>
            </div>
            
            <div class="button-group">
                <button onclick="checkSubsets()" class="btn btn-info">🔍 بررسی دیگر</button>
                <button onclick="showMainMenu()" class="btn btn-secondary">🔙 منوی اصلی</button>
            </div>
        </div>
    `;
}

function showAllSubsets() {
    const setNames = Array.from(AppState.sets.keys());
    let relationsHTML = '';
    
    setNames.forEach((nameA, i) => {
        setNames.forEach((nameB, j) => {
            if (i !== j) {
                const setA = AppState.sets.get(nameA);
                const setB = AppState.sets.get(nameB);
                
                if (setA && setB && isSubsetOf(setA.elements, setB.elements)) {
                    const isProper = setA.elements.length < setB.elements.length;
                    const symbol = isProper ? '⊂' : '⊆';
                    relationsHTML += `
                        <div class="relation-item">
                            <div class="relation-type">
                                <span>${symbol}</span>
                                ${nameA} ${symbol} ${nameB}
                            </div>
                            <div class="relation-sets">
                                ${nameA} = ${formatSet(setA.elements)}<br>
                                ${nameB} = ${formatSet(setB.elements)}
                            </div>
                        </div>
                    `;
                }
            }
        });
    });
    
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>📋 همه روابط زیرمجموعه‌ای</h3>
            
            ${relationsHTML ? `
                <div class="relations-grid">
                    ${relationsHTML}
                </div>
            ` : `
                <p>هیچ رابطه زیرمجموعه‌ای بین مجموعه‌ها وجود ندارد.</p>
            `}
            
            <div class="button-group">
                <button onclick="checkSubsets()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

function showUniversalSets() {
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>🌍 مجموعه‌های جهانی</h3>
            <p>مجموعه‌های استاندارد ریاضی:</p>
            
            <div class="sets-list">
                ${Object.entries(AppState.universalSets).map(([name, elements]) => `
                    <div class="set-item">
                        <div class="set-name">${name}</div>
                        <div class="set-content">${formatSet(elements)}</div>
                        ${AppState.infiniteSetsInfo && AppState.infiniteSetsInfo[name] ? `<p style="color: #856404; background: #fff3cd; padding: 10px; border-radius: 8px; margin-top: 10px; font-size: 0.9rem;">${AppState.infiniteSetsInfo[name]}</p>` : ''}
                        <div class="set-actions">
                            <button onclick="addUniversalSet('${name}')" class="btn btn-success">➕ افزودن به مجموعه‌ها</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="button-group">
                <button onclick="showMainMenu()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

function addUniversalSet(name) {
    if (AppState.sets.has(name)) {
        showMessage(`مجموعه "${name}" از قبل وجود دارد`, 'warning');
        return;
    }
    
    AppState.sets.set(name, {
        type: 'universal',
        elements: [...AppState.universalSets[name]],
        createdAt: new Date().toISOString()
    });
    
    HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());
    StorageManager.saveState();
    updateStats();
    
    if (AppState.infiniteSetsInfo && AppState.infiniteSetsInfo[name]) {
        showMessage(`✅ مجموعه "${name}" افزوده شد. ${AppState.infiniteSetsInfo[name]}`, 'warning', 8000);
    } else {
        showMessage(`✅ مجموعه "${name}" افزوده شد`, 'success');
    }
    
    showUniversalSets();
}

function showSearch() {
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>🔎 جستجو در مجموعه‌ها</h3>
            <p>عبارت مورد نظر برای جستجو را وارد کنید:</p>
            
            <div class="form-group">
                <label class="form-label">عبارت جستجو:</label>
                <input type="text" id="searchQuery" class="form-input" placeholder="مثال: 5 یا فرد یا مجموعه A">
            </div>
            
            <div class="button-group">
                <button onclick="performSearch()" class="btn btn-success">🔍 جستجو</button>
                <button onclick="showMainMenu()" class="btn btn-secondary">🔙 بازگشت</button>
            </div>
        </div>
    `;
}

function performSearch() {
    const query = document.getElementById('searchQuery').value.trim();
    
    if (!query) {
        showMessage('لطفاً عبارت جستجو را وارد کنید', 'error');
        return;
    }
    
    const results = SearchManager.search(query);
    
    let resultsHTML = '';
    
    if (results.length === 0) {
        resultsHTML = '<p>هیچ نتیجه‌ای یافت نشد.</p>';
    } else {
        results.forEach(result => {
            resultsHTML += `
                <div class="search-result-item">
                    <div class="set-name">${result.set}</div>
                    <p>${result.match}</p>
                    <div class="set-actions">
                        <button onclick="showSetDetails('${result.set}')" class="btn btn-info">📊 جزئیات</button>
                    </div>
                </div>
            `;
        });
    }
    
    document.getElementById("step").innerHTML = `
        <div class="step-container">
            <h3>🔎 نتایج جستجو برای "${query}"</h3>
            <p>تعداد نتایج: <strong>${results.length}</strong></p>
            
            <div class="search-results">
                ${resultsHTML}
            </div>
            
            <div class="button-group">
                <button onclick="showSearch()" class="btn btn-info">🔍 جستجوی دیگر</button>
                <button onclick="showMainMenu()" class="btn btn-secondary">🔙 منوی اصلی</button>
            </div>
        </div>
    `;
}

// راه‌اندازی برنامه
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 آزمایشگاه مجموعه‌ها در حال راه‌اندازی... - نسخه V.4.05');
    
    StorageManager.clearAllData();
    
    setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }, 800);
    
    try {
        SetOperationsTests.runAllTests();
    } catch (e) {
        console.log('تست‌ها با خطا مواجه شدند:', e);
    }
    
    HistoryManager.pushState(HistoryManager.getCurrentStateForHistory());
    
    InputTracker.init();
    SmartKeyboard.init();
    
    const startBtn = document.getElementById('startBtn');
    const showSetsBtn = document.getElementById('showSetsBtn');
    const addSetBtn = document.getElementById('addSetBtn');
    const undoBtn = document.getElementById('undoBtn');
    const clearBtn = document.getElementById('clearBtn');
    const helpBtn = document.getElementById('helpBtn');
    const debugBtn = document.getElementById('debugBtn');
    
    if (startBtn) startBtn.addEventListener('click', start);
    if (showSetsBtn) showSetsBtn.addEventListener('click', showAllSets);
    if (addSetBtn) addSetBtn.addEventListener('click', addNewSet);
    if (undoBtn) undoBtn.addEventListener('click', undoLastAction);
    if (clearBtn) clearBtn.addEventListener('click', clearAllSets);
    if (helpBtn) helpBtn.addEventListener('click', showHelp);
    if (debugBtn) debugBtn.addEventListener('click', debugAppState);
    
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z') {
                e.preventDefault();
                undoLastAction();
            } else if (e.key === 'y') {
                e.preventDefault();
                redoLastAction();
            }
        }
    });
    
    updateStats();
    showMainMenu();
});

document.addEventListener('scroll', function() {
    const scrollBtn = document.getElementById('scrollToTop');
    if (scrollBtn) {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.remove('show');
        }
    }
});

document.getElementById('scrollToTop')?.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

console.log('🎉 آزمایشگاه مجموعه‌ها با موفقیت بارگذاری شد! - نسخه V.4.05');