import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Droplets, Calendar as CalendarIcon, Calculator, X, Save, Trash2, Plus, Minus } from 'lucide-react';
import './index.css';
import FarmAnimation from './FarmAnimation';


const QUANTITIES = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3];

function formatQuantityLabel(qty) {
  if (qty === 0) return 'None';
  if (Number.isInteger(qty)) return `${qty} L`;
  const whole = Math.floor(qty);
  const fraction = qty - whole;
  let fracText = '';
  if (fraction === 0.25) fracText = '1/4';
  else if (fraction === 0.5) fracText = '1/2';
  else if (fraction === 0.75) fracText = '3/4';
  else fracText = fraction.toFixed(2);
  
  if (whole === 0) return `${fracText} L`;
  // Use en space \u2002 to create a clear visible gap between whole number and fraction
  return `${whole}\u2002${fracText} L`;
}

function getTeluguQuantityLabel(qty) {
  if (qty === 0) return 'ఏమీ లేదు';
  
  const whole = Math.floor(qty);
  const fraction = qty - whole;
  
  const teluguNumbers = {
    1: { name: 'ఒకటి', prefix: 'ఒక', suffixPaavu: 'ఒకటింపావు', suffixNnara: 'ఒకటిన్నర' },
    2: { name: 'రెండు', prefix: 'రెండు', suffixPaavu: 'రెండుంపావు', suffixNnara: 'రెండున్నర' },
    3: { name: 'మూడు', prefix: 'మూడు', suffixPaavu: 'మూడుంపావు', suffixNnara: 'మూడున్నర' },
    4: { name: 'నాలుగు', prefix: 'నాలుగు', suffixPaavu: 'నాలుగుంపావు', suffixNnara: 'నాలుగున్నర' },
    5: { name: 'ఐదు', prefix: 'ఐదు', suffixPaavu: 'ఐదుంపావు', suffixNnara: 'ఐదున్నర' },
    6: { name: 'ఆరు', prefix: 'ఆరు', suffixPaavu: 'ఆరుంపావు', suffixNnara: 'ఆరున్నర' },
    7: { name: 'ఏడు', prefix: 'ఏడు', suffixPaavu: 'ఏడుంపావు', suffixNnara: 'ఏడున్నర' },
    8: { name: 'ఎనిమిది', prefix: 'ఎనిమిది', suffixPaavu: 'ఎనిమిదింపావు', suffixNnara: 'ఎనిమిదిన్నర' },
    9: { name: 'తొమ్మిది', prefix: 'తొమ్మిది', suffixPaavu: 'తొమ్మిదింపావు', suffixNnara: 'తొమ్మిదిన్నర' },
    10: { name: 'పది', prefix: 'పది', suffixPaavu: 'పదింపావు', suffixNnara: 'పదిన్నర' }
  };

  const getWholeName = (w) => {
    return teluguNumbers[w] ? teluguNumbers[w].name : w.toString();
  };
  
  if (whole === 0) {
    if (fraction === 0.25) return 'పావు లీటరు';
    if (fraction === 0.5) return 'అర లీటరు';
    if (fraction === 0.75) return 'ముప్పావు లీటరు';
    return `${fraction.toFixed(2)} లీటరు`;
  }
  
  if (fraction === 0) {
    if (whole === 1) return 'ఒక లీటరు';
    return `${getWholeName(whole)} లీటర్లు`;
  }
  
  const item = teluguNumbers[whole];
  const unit = whole === 1 ? 'లీటరు' : 'లీటర్లు';
  
  if (fraction === 0.25) {
    return item ? `${item.suffixPaavu} ${unit}` : `${whole}ంపావు ${unit}`;
  }
  if (fraction === 0.5) {
    return item ? `${item.suffixNnara} ${unit}` : `${whole}న్నర ${unit}`;
  }
  if (fraction === 0.75) {
    const wholePrefix = item ? item.prefix : whole.toString();
    return `${wholePrefix} ముప్పావు ${unit}`;
  }
  
  return `${whole}.${(fraction*100).toFixed(0)} ${unit}`;
}

function formatCurrency(value) {
  if (isNaN(value) || value <= 0) return { main: '0', decimal: '00' };
  const parts = value.toFixed(2).split('.');
  return { main: parts[0], decimal: parts[1] };
}

function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isNaN(value)) return;
    let start = displayValue;
    const end = value;
    const duration = 400; 
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress); 
      const current = start + (end - start) * easeProgress;
      setDisplayValue(current);
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplayValue(end);
    };
    requestAnimationFrame(animate);
  }, [value]);

  const formatted = formatCurrency(displayValue);

  return (
    <div className="cost-value">
      <span className="cost-currency">₹</span>
      {formatted.main}
      <span className="cost-decimal">.{formatted.decimal}</span>
    </div>
  );
}

function App() {
  const [baseCost, setBaseCost] = useState(60); 
  const defaultQuantity = 0; 
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Overrides: { "YYYY-MM-DD": quantity }
  const [overrides, setOverrides] = useState({});
  
  // Selected day for overriding
  const [selectedDayStr, setSelectedDayStr] = useState(null);

  // Saved Calculations State
  const [savedCalculations, setSavedCalculations] = useState(() => {
    try {
      const saved = localStorage.getItem('milk_tracker_saved');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('milk_tracker_saved', JSON.stringify(savedCalculations));
  }, [savedCalculations]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayStr(null);
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayStr(null);
  };

  const getDayString = (d) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const getQuantityForDay = (d) => {
    const dayStr = getDayString(d);
    return overrides[dayStr] !== undefined ? overrides[dayStr] : defaultQuantity;
  };

  // Calculations
  const calculations = useMemo(() => {
    let totalL = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      totalL += getQuantityForDay(d);
    }
    return {
      totalLiters: totalL,
      totalCost: totalL * baseCost
    };
  }, [daysInMonth, overrides, defaultQuantity, baseCost, month, year]);

  const handleSaveCalculation = () => {
    const newCalculation = {
      id: Date.now().toString(),
      monthName: monthName,
      year: year,
      totalLiters: calculations.totalLiters,
      baseCost: baseCost,
      totalCost: calculations.totalCost,
      dateSaved: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setSavedCalculations((prev) => [newCalculation, ...prev]);
  };

  const handleDeleteCalculation = (id) => {
    setSavedCalculations((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDayClick = (d) => {
    setSelectedDayStr(getDayString(d));
  };

  const handleStepQty = (step) => {
    if (!selectedDayStr) return;
    const currentVal = overrides[selectedDayStr] !== undefined ? overrides[selectedDayStr] : defaultQuantity;
    const newVal = Math.max(0, currentVal + step);
    setOverrides(prev => ({
      ...prev,
      [selectedDayStr]: newVal
    }));
  };

  const handlePresetSelect = (multiplier) => {
    if (!selectedDayStr) return;
    setOverrides(prev => ({
      ...prev,
      [selectedDayStr]: multiplier
    }));
  };

  // Generate blank cells for days before the 1st
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <>
      <FarmAnimation />
      <div className="app-container">
      <header>
        <h1>Pure Calc</h1>
        <p className="subtitle">Smart Daily Milk Tracker</p>
      </header>

      {/* Global Settings */}
      <section className="input-section">
        <div className="input-group">
          <label htmlFor="base-cost">Cost per 1 Liter</label>
          <div className="input-wrapper">
            <span className="currency-symbol">₹</span>
            <input
              type="number"
              id="base-cost"
              name="milk-rate-value"
              autoComplete="off"
              value={baseCost || ''}
              onChange={(e) => setBaseCost(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              min="0"
              step="1"
            />
          </div>
        </div>

      </section>

      {/* Calendar Section */}
      <section className="calendar-section">
        <div className="calendar-header">
          <button className="icon-btn" onClick={handlePrevMonth}><ChevronLeft /></button>
          <h2>{monthName} {year}</h2>
          <button className="icon-btn" onClick={handleNextMonth}><ChevronRight /></button>
        </div>

        <div className="weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {blanks.map(b => <div key={`blank-${b}`} className="calendar-day blank"></div>)}
          
          {days.map(d => {
            const dayStr = getDayString(d);
            const qty = getQuantityForDay(d);
            const isOverridden = overrides[dayStr] !== undefined && overrides[dayStr] !== defaultQuantity;
            const isSelected = selectedDayStr === dayStr;

            return (
              <div 
                key={d} 
                className={`calendar-day ${isSelected ? 'selected' : ''} ${isOverridden ? 'overridden' : ''} ${qty === 0 ? 'zero-qty' : ''}`}
                onClick={() => handleDayClick(d)}
              >
                <div className="day-number">{d}</div>
                <div className="day-qty">{qty > 0 ? formatQuantityLabel(qty) : '-'}</div>
              </div>
            );
          })}
        </div>

        {/* Override Panel */}
        {selectedDayStr && (() => {
          const currentQty = overrides[selectedDayStr] !== undefined ? overrides[selectedDayStr] : defaultQuantity;
          return (
            <div className="override-panel">
              <div className="override-header">
                <h3>Edit Milk for {selectedDayStr}</h3>
                <button className="icon-btn small" onClick={() => setSelectedDayStr(null)}><X size={18} /></button>
              </div>
              
              {/* Stepper Control */}
              <div className="qty-stepper">
                <button 
                  className="stepper-btn" 
                  onClick={() => handleStepQty(-0.25)}
                  disabled={currentQty <= 0}
                  title="Decrease 250ml"
                >
                  <Minus size={18} />
                </button>
                <div className="stepper-display">
                  <span className="stepper-label">{formatQuantityLabel(currentQty)}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.1rem' }}>
                    {currentQty > 0 && <span className="stepper-sub">({(currentQty * 1000)} ml)</span>}
                  </div>
                  <div className="stepper-telugu">
                    {getTeluguQuantityLabel(currentQty)}
                  </div>
                </div>
                <button 
                  className="stepper-btn" 
                  onClick={() => handleStepQty(0.25)}
                  title="Increase 250ml"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="preset-label">Quick Select</div>
              <div className="options-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))'}}>
                {QUANTITIES.map((q, idx) => (
                  <button 
                    key={idx} 
                    className={`option-btn mini-btn ${currentQty === q ? 'active' : ''}`}
                    onClick={() => handlePresetSelect(q)}
                  >
                    <span>{formatQuantityLabel(q)}</span>
                  </button>
                ))}
              </div>

              {/* Done / Confirm button */}
              <div className="override-footer">
                <button className="confirm-btn" onClick={() => setSelectedDayStr(null)}>
                  Done
                </button>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Summary Dashboard */}
      <section className="summary-dashboard">
        <h2 className="dashboard-title"><Calculator size={24}/> {monthName} Summary</h2>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-label">Total Days</span>
            <div className="cost-value highlight">{daysInMonth}</div>
          </div>
          
          <div className="stat-card">
            <span className="stat-label">Total Liters</span>
            <div className="cost-value highlight">
              {calculations.totalLiters.toFixed(2)}<span className="cost-decimal">L</span>
            </div>
          </div>

          <div className="stat-card total-card">
            <span className="stat-label">Total Cost</span>
            <AnimatedNumber value={calculations.totalCost} />
          </div>
        </div>

        <div className="save-btn-wrapper">
          <button className="save-calc-btn" onClick={handleSaveCalculation}>
            <Save size={18} />
            <span>Save {monthName} Calculation</span>
          </button>
        </div>
      </section>

      {/* Saved Calculations History */}
      {savedCalculations.length > 0 && (
        <section className="history-section">
          <h2 className="history-title">Saved Calculations</h2>
          <div className="history-list">
            {savedCalculations.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-info">
                  <div className="history-month">{item.monthName} {item.year}</div>
                  <div className="history-details">
                    <span>{item.totalLiters.toFixed(2)} L</span>
                    <span className="dot">•</span>
                    <span>₹{item.baseCost}/L</span>
                  </div>
                  <div className="history-date">Saved on {item.dateSaved}</div>
                </div>
                <div className="history-right">
                  <div className="history-cost">
                    <span className="history-currency">₹</span>
                    {item.totalCost.toFixed(2)}
                  </div>
                  <button className="delete-btn" onClick={() => handleDeleteCalculation(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      </div>
    </>
  );
}

export default App;
