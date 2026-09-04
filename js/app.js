import { APP_CONFIG, CATEGORIES } from './config.js';
import { WeatherService } from './weatherService.js';
import { PackingEngine } from './packingEngine.js';
import { StorageService } from './storageService.js';

class SmartPackingApp {
  constructor() {
    // Calculate default dates: Today to +3 days (4 days total)
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 3);

    this.state = {
      startDate: this.formatDateYMD(today),
      endDate: this.formatDateYMD(futureDate),
      days: 4,
      selectedCity: null,
      weather: null,
      items: [],
      filter: 'all',
      isLoading: false,
      baggage: {
        presetId: 'checked_20',
        limitKg: 20,
        emptyBagKg: 3.8,
        packedOnly: false
      }
    };

    this.debounceTimer = null;

    // Cache DOM Elements
    this.dom = {
      // Inputs
      inputCity: document.getElementById('input-city'),
      btnClearCity: document.getElementById('btn-clear-city'),
      autocompleteList: document.getElementById('autocomplete-list'),
      inputStartDate: document.getElementById('input-start-date'),
      inputEndDate: document.getElementById('input-end-date'),
      displayDays: document.getElementById('display-days'),
      durationChips: document.querySelectorAll('.duration-chip'),
      btnGeneratePlan: document.getElementById('btn-generate-plan'),
      btnGenerateText: document.getElementById('btn-generate-text'),
      btnGenerateIcon: document.getElementById('btn-generate-icon'),
      btnGenerateSpinner: document.getElementById('btn-generate-spinner'),
      cityChips: document.querySelectorAll('.city-chip'),

      // Sections
      emptyState: document.getElementById('empty-state'),
      weatherSection: document.getElementById('weather-section'),
      weightSection: document.getElementById('weight-section'),
      checklistSection: document.getElementById('checklist-section'),

      // Luggage Scale Elements
      selectBaggagePreset: document.getElementById('select-baggage-preset'),
      weightCurrentKg: document.getElementById('weight-current-kg'),
      weightLimitKg: document.getElementById('weight-limit-kg'),
      weightRemainingBadge: document.getElementById('weight-remaining-badge'),
      weightRemainingText: document.getElementById('weight-remaining-text'),
      weightPercentageText: document.getElementById('weight-percentage-text'),
      weightBarFill: document.getElementById('weight-bar-fill'),
      weightEmptyBagText: document.getElementById('weight-empty-bag-text'),
      weightItemsText: document.getElementById('weight-items-text'),
      checkWeightPackedOnly: document.getElementById('check-weight-packed-only'),
      weightOverweightAlert: document.getElementById('weight-overweight-alert'),
      weightOverweightDesc: document.getElementById('weight-overweight-desc'),

      // Weather elements
      weatherCityTitle: document.getElementById('weather-city-title'),
      weatherDateRangeBadge: document.getElementById('weather-date-range-badge'),
      weatherDateRangeText: document.getElementById('weather-date-range-text'),
      weatherLastUpdated: document.getElementById('weather-last-updated'),
      weatherSummaryBadges: document.getElementById('weather-summary-badges'),
      weatherDailyGrid: document.getElementById('weather-daily-grid'),
      weatherInsightText: document.getElementById('weather-insight-text'),
      weatherForecastDaysLabel: document.getElementById('weather-forecast-days-label'),

      // Progress & Checklist
      progressPercent: document.getElementById('progress-percent'),
      progressCount: document.getElementById('progress-count'),
      progressBarFill: document.getElementById('progress-bar-fill'),
      badgeTotalItems: document.getElementById('badge-total-items'),
      categoriesContainer: document.getElementById('categories-container'),
      filterTabs: document.querySelectorAll('.filter-tab'),
      countAll: document.getElementById('count-all'),
      countUnpacked: document.getElementById('count-unpacked'),
      countPacked: document.getElementById('count-packed'),

      // Actions
      btnCheckAll: document.getElementById('btn-check-all'),
      btnUncheckAll: document.getElementById('btn-uncheck-all'),
      btnResetTrip: document.getElementById('btn-reset-trip'),
      btnSaveTripBookmark: document.getElementById('btn-save-trip-bookmark'),
      btnOpenHistory: document.getElementById('btn-open-history'),
      savedTripsCount: document.getElementById('saved-trips-count'),
      btnExportOptions: document.getElementById('btn-export-options'),

      // Modals
      modalAddItem: document.getElementById('modal-add-item'),
      formAddItem: document.getElementById('form-add-item'),
      addItemName: document.getElementById('add-item-name'),
      addItemQty: document.getElementById('add-item-qty'),
      addItemUnit: document.getElementById('add-item-unit'),
      addItemWeight: document.getElementById('add-item-weight'),
      addItemCategory: document.getElementById('add-item-category'),
      addItemReason: document.getElementById('add-item-reason'),
      btnOpenAddModal: document.getElementById('btn-add-item-modal'),
      btnCloseAddModal: document.getElementById('btn-close-add-modal'),
      btnCancelAdd: document.getElementById('btn-cancel-add'),

      modalHistory: document.getElementById('modal-history'),
      historyTripsList: document.getElementById('history-trips-list'),
      btnCloseHistoryModal: document.getElementById('btn-close-history-modal'),
      btnCloseHistoryFooter: document.getElementById('btn-close-history-footer'),

      modalExport: document.getElementById('modal-export'),
      btnCloseExportModal: document.getElementById('btn-close-export-modal'),
      btnCloseExportFooter: document.getElementById('btn-close-export-footer'),
      btnActionCopyText: document.getElementById('btn-action-copy-text'),
      btnActionPrint: document.getElementById('btn-action-print'),
      btnActionDownloadJson: document.getElementById('btn-action-download-json'),

      // Print
      printTitle: document.getElementById('print-title'),
      printSubtitle: document.getElementById('print-subtitle'),

      // Toast
      toastContainer: document.getElementById('toast-container')
    };

    this.init();
  }

  formatDateYMD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  formatDateThai(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  init() {
    this.populateCategorySelect();
    this.populateBaggagePresets();
    this.setupDateInputs();
    this.bindEvents();
    this.updateSavedTripsBadge();

    // Check LocalStorage for saved active trip
    const savedTrip = StorageService.loadCurrentTrip();
    if (savedTrip && savedTrip.destination && savedTrip.items && savedTrip.items.length > 0) {
      this.restoreTrip(savedTrip);
      this.showToast('โหลดข้อมูลทริปล่าสุดจาก LocalStorage เรียบร้อยแล้ว', 'info');
    }
  }

  populateCategorySelect() {
    this.dom.addItemCategory.innerHTML = '';
    Object.values(CATEGORIES).forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      this.dom.addItemCategory.appendChild(opt);
    });
  }

  populateBaggagePresets() {
    this.dom.selectBaggagePreset.innerHTML = '';
    APP_CONFIG.BAGGAGE_PRESETS.forEach(preset => {
      const opt = document.createElement('option');
      opt.value = preset.id;
      opt.textContent = preset.name;
      if (preset.id === this.state.baggage.presetId) {
        opt.selected = true;
      }
      this.dom.selectBaggagePreset.appendChild(opt);
    });
  }

  setupDateInputs() {
    this.dom.inputStartDate.value = this.state.startDate;
    this.dom.inputEndDate.value = this.state.endDate;
    this.dom.inputStartDate.min = this.formatDateYMD(new Date());
    this.dom.inputEndDate.min = this.state.startDate;
    this.recalculateDays();
  }

  recalculateDays() {
    const start = new Date(this.dom.inputStartDate.value);
    const end = new Date(this.dom.inputEndDate.value);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      this.state.days = 1;
    } else {
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
      this.state.days = Math.max(1, Math.min(diffDays, 16));
    }

    this.state.startDate = this.dom.inputStartDate.value;
    this.state.endDate = this.dom.inputEndDate.value;
    this.dom.displayDays.textContent = this.state.days;

    // Highlight active chip
    this.dom.durationChips.forEach(chip => {
      if (parseInt(chip.dataset.days, 10) === this.state.days) {
        chip.className = 'duration-chip px-2.5 py-1 bg-blue-600 text-white rounded-lg font-medium transition shadow-sm';
      } else {
        chip.className = 'duration-chip px-2.5 py-1 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-slate-600 font-medium transition';
      }
    });
  }

  bindEvents() {
    // Baggage Preset Selector
    this.dom.selectBaggagePreset.addEventListener('change', (e) => {
      const selected = APP_CONFIG.BAGGAGE_PRESETS.find(p => p.id === e.target.value);
      if (selected) {
        this.state.baggage.presetId = selected.id;
        this.state.baggage.limitKg = selected.limitKg;
        this.state.baggage.emptyBagKg = selected.emptyBagKg;
        this.updateLuggageWeight();
        this.persistCurrentTrip();
      }
    });

    // Packed Only checkbox for weight
    this.dom.checkWeightPackedOnly.addEventListener('change', (e) => {
      this.state.baggage.packedOnly = e.target.checked;
      this.updateLuggageWeight();
      this.persistCurrentTrip();
    });

    // Date changes
    this.dom.inputStartDate.addEventListener('change', () => {
      const start = new Date(this.dom.inputStartDate.value);
      const end = new Date(this.dom.inputEndDate.value);
      this.dom.inputEndDate.min = this.dom.inputStartDate.value;

      if (end < start) {
        const newEnd = new Date(start);
        newEnd.setDate(start.getDate() + 3);
        this.dom.inputEndDate.value = this.formatDateYMD(newEnd);
      }
      this.recalculateDays();
    });

    this.dom.inputEndDate.addEventListener('change', () => {
      const start = new Date(this.dom.inputStartDate.value);
      const end = new Date(this.dom.inputEndDate.value);

      if (end < start) {
        this.dom.inputStartDate.value = this.dom.inputEndDate.value;
      }
      this.recalculateDays();
    });

    // Duration preset chips
    this.dom.durationChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const count = parseInt(chip.dataset.days, 10);
        const start = new Date(this.dom.inputStartDate.value || new Date());
        const newEnd = new Date(start);
        newEnd.setDate(start.getDate() + (count - 1));

        this.dom.inputEndDate.value = this.formatDateYMD(newEnd);
        this.recalculateDays();
      });
    });

    // City Autocomplete input
    this.dom.inputCity.addEventListener('input', (e) => this.handleCityInput(e.target.value));
    this.dom.inputCity.addEventListener('focus', () => {
      if (this.dom.inputCity.value.trim().length >= 2) {
        this.dom.autocompleteList.classList.remove('hidden');
      }
    });

    // Close autocomplete when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.dom.inputCity.contains(e.target) && !this.dom.autocompleteList.contains(e.target)) {
        this.dom.autocompleteList.classList.add('hidden');
      }
    });

    // Clear city input
    this.dom.btnClearCity.addEventListener('click', () => {
      this.dom.inputCity.value = '';
      this.state.selectedCity = null;
      this.dom.btnClearCity.classList.add('hidden');
      this.dom.autocompleteList.classList.add('hidden');
      this.dom.inputCity.focus();
    });

    // Quick City Chips
    this.dom.cityChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const cityQuery = chip.dataset.city;
        this.dom.inputCity.value = chip.textContent.trim();
        this.selectCityByName(cityQuery);
      });
    });

    // Generate Plan Button
    this.dom.btnGeneratePlan.addEventListener('click', () => this.generatePackingPlan());

    // Filter Tabs
    this.dom.filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.state.filter = tab.dataset.filter;
        this.updateFilterTabsUI();
        this.renderChecklist();
      });
    });

    // Bulk checklist actions
    this.dom.btnCheckAll.addEventListener('click', () => this.setAllItemsChecked(true));
    this.dom.btnUncheckAll.addEventListener('click', () => this.setAllItemsChecked(false));

    // Reset button
    this.dom.btnResetTrip.addEventListener('click', () => {
      if (confirm('คุณต้องการล้างรายการปัจจุบันและเริ่มใหม่ใช่หรือไม่?')) {
        this.resetAll();
      }
    });

    // Bookmark / Save trip
    this.dom.btnSaveTripBookmark.addEventListener('click', () => this.saveTripBookmark());

    // History Modal
    this.dom.btnOpenHistory.addEventListener('click', () => this.openHistoryModal());
    this.dom.btnCloseHistoryModal.addEventListener('click', () => this.dom.modalHistory.classList.add('hidden'));
    this.dom.btnCloseHistoryFooter.addEventListener('click', () => this.dom.modalHistory.classList.add('hidden'));

    // Export Modal
    this.dom.btnExportOptions.addEventListener('click', () => this.dom.modalExport.classList.remove('hidden'));
    this.dom.btnCloseExportModal.addEventListener('click', () => this.dom.modalExport.classList.add('hidden'));
    this.dom.btnCloseExportFooter.addEventListener('click', () => this.dom.modalExport.classList.add('hidden'));

    // Export Actions
    this.dom.btnActionCopyText.addEventListener('click', () => this.copyChecklistText());
    this.dom.btnActionPrint.addEventListener('click', () => {
      this.dom.modalExport.classList.add('hidden');
      window.print();
    });
    this.dom.btnActionDownloadJson.addEventListener('click', () => this.downloadJsonBackup());

    // Add Custom Item Modal
    this.dom.btnOpenAddModal.addEventListener('click', () => {
      this.dom.modalAddItem.classList.remove('hidden');
      this.dom.addItemName.focus();
    });
    this.dom.btnCloseAddModal.addEventListener('click', () => this.dom.modalAddItem.classList.add('hidden'));
    this.dom.btnCancelAdd.addEventListener('click', () => this.dom.modalAddItem.classList.add('hidden'));
    this.dom.formAddItem.addEventListener('submit', (e) => this.handleAddCustomItem(e));
  }

  // Handle autocomplete typing
  handleCityInput(val) {
    const query = val.trim();
    if (query.length > 0) {
      this.dom.btnClearCity.classList.remove('hidden');
    } else {
      this.dom.btnClearCity.classList.add('hidden');
      this.dom.autocompleteList.classList.add('hidden');
      this.state.selectedCity = null;
      return;
    }

    clearTimeout(this.debounceTimer);
    if (query.length < 2) {
      this.dom.autocompleteList.classList.add('hidden');
      return;
    }

    this.debounceTimer = setTimeout(async () => {
      try {
        const results = await WeatherService.searchCity(query);
        this.renderAutocomplete(results);
      } catch (err) {
        console.warn('Geocoding search failed:', err);
      }
    }, 300);
  }

  renderAutocomplete(results) {
    this.dom.autocompleteList.innerHTML = '';
    if (!results || results.length === 0) {
      this.dom.autocompleteList.innerHTML = `
        <div class="p-3 text-xs text-slate-400 text-center">ไม่พบชื่อเมืองที่ค้นหา ลองพิมพ์ชื่อเป็นภาษาอังกฤษ</div>
      `;
      this.dom.autocompleteList.classList.remove('hidden');
      return;
    }

    results.forEach(city => {
      const item = document.createElement('div');
      item.className = 'px-4 py-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition text-sm';
      item.innerHTML = `
        <div class="flex items-center space-x-2">
          <i class="fa-solid fa-location-dot text-rose-500 text-xs"></i>
          <div>
            <span class="font-medium text-slate-800">${city.name}</span>
            <span class="text-xs text-slate-400 ml-1">${city.admin1 ? `${city.admin1}, ` : ''}${city.country}</span>
          </div>
        </div>
        <span class="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">${city.countryCode}</span>
      `;
      item.addEventListener('click', () => {
        this.state.selectedCity = city;
        this.dom.inputCity.value = `${city.name}, ${city.country}`;
        this.dom.autocompleteList.classList.add('hidden');
      });
      this.dom.autocompleteList.appendChild(item);
    });

    this.dom.autocompleteList.classList.remove('hidden');
  }

  async selectCityByName(cityName) {
    try {
      this.setButtonLoading(true);
      const results = await WeatherService.searchCity(cityName);
      if (results && results.length > 0) {
        this.state.selectedCity = results[0];
        this.dom.inputCity.value = `${results[0].name}, ${results[0].country}`;
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.setButtonLoading(false);
    }
  }

  setButtonLoading(isLoading) {
    this.state.isLoading = isLoading;
    if (isLoading) {
      this.dom.btnGenerateText.textContent = 'กำลังดึงสภาพอากาศ...';
      this.dom.btnGenerateIcon.classList.add('hidden');
      this.dom.btnGenerateSpinner.classList.remove('hidden');
      this.dom.btnGeneratePlan.disabled = true;
    } else {
      this.dom.btnGenerateText.textContent = 'สร้างรายการจัดกระเป๋า';
      this.dom.btnGenerateIcon.classList.remove('hidden');
      this.dom.btnGenerateSpinner.classList.add('hidden');
      this.dom.btnGeneratePlan.disabled = false;
    }
  }

  async generatePackingPlan() {
    const rawCity = this.dom.inputCity.value.trim();
    if (!rawCity) {
      this.showToast('กรุณากรอกชื่อเมืองปลายทาง', 'error');
      this.dom.inputCity.focus();
      return;
    }

    try {
      this.setButtonLoading(true);
      this.recalculateDays();

      // If city hasn't been selected from dropdown, geocode it now
      if (!this.state.selectedCity || !this.state.selectedCity.latitude) {
        const searchResults = await WeatherService.searchCity(rawCity);
        if (!searchResults || searchResults.length === 0) {
          throw new Error(`ไม่พบพิกัดของเมือง "${rawCity}" กรุณาลองตรวจสอบการสะกดหรือพิมพ์ชื่อภาษาอังกฤษ`);
        }
        this.state.selectedCity = searchResults[0];
        this.dom.inputCity.value = `${searchResults[0].name}, ${searchResults[0].country}`;
      }

      // Fetch Weather Forecast with exact dates
      const weather = await WeatherService.getWeatherForecast(
        this.state.selectedCity.latitude,
        this.state.selectedCity.longitude,
        this.state.days,
        this.state.startDate,
        this.state.endDate
      );
      this.state.weather = weather;

      // Generate Packing items with Rule-based Engine
      const recommendedItems = PackingEngine.generateList(
        weather,
        this.state.days,
        this.state.selectedCity
      );
      this.state.items = recommendedItems;

      // Update luggage weight
      this.updateLuggageWeight();

      // Save to LocalStorage
      this.persistCurrentTrip();

      // Render UI
      this.renderWeatherDashboard();
      this.renderChecklist();
      this.updateProgress();

      // Show sections
      this.dom.emptyState.classList.add('hidden');
      this.dom.weatherSection.classList.remove('hidden');
      this.dom.weightSection.classList.remove('hidden');
      this.dom.checklistSection.classList.remove('hidden');

      this.showToast(`สร้างรายการสำเร็จสำหรับ ${this.state.selectedCity.name}!`, 'success');

      // Smooth scroll to weather dashboard
      this.dom.weatherSection.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
      console.error(error);
      this.showToast(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสภาพอากาศ', 'error');
    } finally {
      this.setButtonLoading(false);
    }
  }

  updateLuggageWeight() {
    const { items, baggage } = this.state;
    if (!items) return;

    // Filter items based on calculation mode
    const itemsToCount = baggage.packedOnly ? items.filter(i => i.checked) : items;
    
    // Sum total weight in grams
    let itemsGrams = 0;
    itemsToCount.forEach(item => {
      const weight = item.weightGrams || 150;
      const qty = item.quantity || 1;
      itemsGrams += weight * qty;
    });

    const itemsKg = Math.round(itemsGrams / 100) / 10;
    const emptyBagKg = baggage.emptyBagKg || 3.8;
    const limitKg = baggage.limitKg || 20.0;
    const totalWeightKg = Math.round((emptyBagKg + itemsKg) * 10) / 10;
    const remainingKg = Math.round((limitKg - totalWeightKg) * 10) / 10;
    const percentage = Math.round((totalWeightKg / limitKg) * 100);

    // Save summary into state baggage object
    this.state.baggage.totalKg = totalWeightKg;
    this.state.baggage.remainingKg = remainingKg;
    this.state.baggage.itemsKg = itemsKg;

    // Update UI DOM
    this.dom.weightCurrentKg.textContent = totalWeightKg.toFixed(1);
    this.dom.weightLimitKg.textContent = limitKg.toFixed(1);
    this.dom.weightEmptyBagText.textContent = `${emptyBagKg.toFixed(1)} kg`;
    this.dom.weightItemsText.textContent = `${itemsKg.toFixed(1)} kg`;
    this.dom.weightPercentageText.textContent = `${percentage}%`;
    this.dom.weightBarFill.style.width = `${Math.min(percentage, 100)}%`;

    // Overweight or Safe logic
    if (totalWeightKg > limitKg) {
      const overKg = Math.round((totalWeightKg - limitKg) * 10) / 10;
      this.dom.weightBarFill.className = 'h-full rounded-full transition-all duration-500 bg-gradient-to-r from-rose-500 to-rose-600';
      this.dom.weightCurrentKg.className = 'text-3xl font-black text-rose-600';
      this.dom.weightRemainingBadge.className = 'inline-flex items-center justify-center text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full mt-1';
      this.dom.weightRemainingText.textContent = `น้ำหนักเกินโควตา ${overKg.toFixed(1)} kg!`;
      
      this.dom.weightOverweightDesc.textContent = `กระเป๋าของคุณหนักเกินโควตาไป ${overKg.toFixed(1)} kg แนะนำให้นำของชิ้นหนักออกหรือซื้อน้ำหนักกระเป๋าเพิ่มล่วงหน้า`;
      this.dom.weightOverweightAlert.classList.remove('hidden');
    } else {
      this.dom.weightCurrentKg.className = 'text-3xl font-black text-slate-900';
      this.dom.weightOverweightAlert.classList.add('hidden');

      if (percentage >= 80) {
        this.dom.weightBarFill.className = 'h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-400 to-amber-500';
        this.dom.weightRemainingBadge.className = 'inline-flex items-center justify-center text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full mt-1';
        this.dom.weightRemainingText.textContent = `ใกล้เต็ม: เหลือช้อปปิ้ง ${remainingKg.toFixed(1)} kg`;
      } else {
        this.dom.weightBarFill.className = 'h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-indigo-600';
        this.dom.weightRemainingBadge.className = 'inline-flex items-center justify-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mt-1';
        this.dom.weightRemainingText.textContent = `เหลือพื้นที่ช้อปปิ้ง ${remainingKg.toFixed(1)} kg`;
      }
    }
  }

  renderWeatherDashboard() {
    const { weather, selectedCity, days, startDate, endDate } = this.state;
    if (!weather || !selectedCity) return;

    const summary = weather.summary;
    const nights = Math.max(0, days - 1);
    const startThai = this.formatDateThai(startDate);
    const endThai = this.formatDateThai(endDate);
    const rangeText = `${startThai} - ${endThai} (รวม ${days} วัน ${nights > 0 ? `${nights} คืน` : ''})`;

    // Title
    this.dom.weatherCityTitle.innerHTML = `
      <i class="fa-solid fa-plane-arrival text-blue-400 text-xl"></i>
      <span>${selectedCity.name}, ${selectedCity.country}</span>
    `;

    this.dom.weatherDateRangeText.textContent = rangeText;
    this.dom.weatherLastUpdated.textContent = `อัปเดต: ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`;
    this.dom.weatherForecastDaysLabel.textContent = `${days} วัน`;

    // Print metadata
    this.dom.printTitle.textContent = `ใบจัดกระเป๋า: ${selectedCity.name}, ${selectedCity.country}`;
    this.dom.printSubtitle.textContent = `ช่วงวัน: ${rangeText} | พยากรณ์อากาศ: ต่ำสุด ${summary.minTemp}°C / สูงสุด ${summary.maxTemp}°C | โอกาสฝน ${summary.maxRainProb}% | น้ำหนักกระเป๋า: ${this.state.baggage.totalKg || 0} kg`;

    // Summary Badges
    this.dom.weatherSummaryBadges.innerHTML = `
      <div class="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold flex items-center gap-1.5">
        <i class="fa-solid fa-temperature-half text-amber-300"></i>
        <span>${summary.minTemp}°C ถึง ${summary.maxTemp}°C (เฉลี่ย ${summary.avgTemp}°C)</span>
      </div>
      ${summary.willRain ? `
        <div class="px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-200 text-xs font-semibold flex items-center gap-1.5">
          <i class="fa-solid fa-cloud-showers-heavy text-blue-300"></i>
          <span>มีโอกาสฝนตก (${summary.rainDaysCount} วัน / สูงสุด ${summary.maxRainProb}%)</span>
        </div>
      ` : `
        <div class="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-semibold flex items-center gap-1.5">
          <i class="fa-solid fa-sun text-amber-300"></i>
          <span>โอกาสฝนน้อย (${summary.maxRainProb}%)</span>
        </div>
      `}
      ${summary.hasSnow ? `
        <div class="px-3 py-1.5 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-200 text-xs font-semibold flex items-center gap-1.5">
          <i class="fa-solid fa-snowflake text-sky-300"></i>
          <span>มีหิมะตก</span>
        </div>
      ` : ''}
      ${summary.isCold ? `
        <div class="px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 text-xs font-semibold flex items-center gap-1.5">
          <i class="fa-solid fa-temperature-low text-indigo-300"></i>
          <span>อากาศหนาว</span>
        </div>
      ` : ''}
      ${summary.isHot ? `
        <div class="px-3 py-1.5 rounded-xl bg-orange-500/20 border border-orange-400/40 text-orange-200 text-xs font-semibold flex items-center gap-1.5">
          <i class="fa-solid fa-temperature-high text-orange-300"></i>
          <span>อากาศร้อน</span>
        </div>
      ` : ''}
    `;

    // Daily Forecast Cards
    this.dom.weatherDailyGrid.innerHTML = '';
    weather.dailyForecast.forEach(day => {
      const card = document.createElement('div');
      card.className = 'bg-white/5 border border-white/10 rounded-xl p-2.5 text-center weather-day-card flex flex-col justify-between min-w-[90px]';
      card.innerHTML = `
        <div>
          <div class="text-[11px] font-semibold text-slate-300">${day.dayName}</div>
          <div class="text-[9px] text-slate-400">${day.formattedDate}</div>
        </div>
        <div class="my-1.5 text-2xl" title="${day.label}">${day.icon}</div>
        <div>
          <div class="text-xs font-bold text-white">${day.maxTemp}° / <span class="text-slate-400 font-normal">${day.minTemp}°</span></div>
          <div class="text-[10px] text-blue-300 flex items-center justify-center gap-0.5 mt-0.5">
            <i class="fa-solid fa-droplet text-[8px]"></i>
            <span>${day.rainProb}%</span>
          </div>
        </div>
      `;
      this.dom.weatherDailyGrid.appendChild(card);
    });

    // Weather Insights
    let insight = `สภาพอากาศช่วงเดินทาง (${startThai} - ${endThai}): อุณหภูมิเฉลี่ย <strong>${summary.avgTemp}°C</strong> `;
    if (summary.hasSnow) {
      insight += `มีเกล็ดหิมะหรืออุณหภูมิติดลบ แนะนำให้เตรียมเสื้อโค้ทหนาพิเศษ, Heattech, และรองเท้าบูทกันลื่นลุยหิมะ`;
    } else if (summary.isCold) {
      insight += `มีอากาศหนาวเย็นต่ำสุด <strong>${summary.minTemp}°C</strong> แนะนำเสื้อแจ็คเก็ตกันลม สเวตเตอร์ และผ้าพันคอ`;
    } else if (summary.isHot) {
      insight += `มีสภาพอากาศร้อนสูงสุด <strong>${summary.maxTemp}°C</strong> แนะนำเสื้อผ้าระบายอากาศ แว่นกันแดด และครีมกันแดด`;
    } else {
      insight += `อากาศสบายๆ กำลังดี เหมาะแก่การท่องเที่ยว`;
    }

    if (summary.willRain) {
      insight += ` • <strong>คำเตือนฝน:</strong> มีโอกาสฝนตกสูงสุด <strong>${summary.maxRainProb}%</strong> จึงได้เพิ่มร่มพับและเสื้อกันฝนลงในเช็กลิสต์ให้แล้ว`;
    }

    this.dom.weatherInsightText.innerHTML = insight;
  }

  renderChecklist() {
    this.dom.categoriesContainer.innerHTML = '';
    const { items, filter } = this.state;

    // Filter items
    const filteredItems = items.filter(item => {
      if (filter === 'packed') return item.checked;
      if (filter === 'unpacked') return !item.checked;
      return true;
    });

    // Update counter labels
    const totalCount = items.length;
    const packedCount = items.filter(i => i.checked).length;
    const unpackedCount = totalCount - packedCount;

    this.dom.countAll.textContent = totalCount;
    this.dom.countPacked.textContent = packedCount;
    this.dom.countUnpacked.textContent = unpackedCount;
    this.dom.badgeTotalItems.textContent = `${totalCount} ชิ้น`;

    // Group filtered items by category
    const categoryGroups = {};
    Object.values(CATEGORIES).forEach(cat => {
      categoryGroups[cat.id] = {
        ...cat,
        items: []
      };
    });

    filteredItems.forEach(item => {
      const catId = item.category || 'custom';
      if (!categoryGroups[catId]) {
        categoryGroups[catId] = {
          id: catId,
          name: 'อื่นๆ',
          icon: 'fa-box',
          color: 'slate',
          items: []
        };
      }
      categoryGroups[catId].items.push(item);
    });

    // Render each category container
    let renderedCategoriesCount = 0;

    Object.values(categoryGroups).forEach(cat => {
      if (cat.items.length === 0) return;
      renderedCategoriesCount++;

      const catCard = document.createElement('div');
      catCard.className = 'category-container bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 space-y-3';
      
      const catPackedCount = cat.items.filter(i => i.checked).length;
      const catTotalCount = cat.items.length;

      catCard.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div class="flex items-center space-x-2.5">
            <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
              <i class="fa-solid ${cat.icon}"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-800 text-sm sm:text-base">${cat.name}</h3>
            </div>
          </div>
          <span class="text-xs text-slate-400 font-medium">${catPackedCount}/${catTotalCount}</span>
        </div>
        <div class="divide-y divide-slate-100" id="cat-items-${cat.id}">
          <!-- Items injected below -->
        </div>
      `;

      const itemsContainer = catCard.querySelector(`#cat-items-${cat.id}`);

      cat.items.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = `item-card flex items-center justify-between py-2.5 px-2 rounded-xl transition hover:bg-slate-50 ${item.checked ? 'checked' : ''}`;
        
        const totalItemWeightGrams = (item.weightGrams || 150) * (item.quantity || 1);
        const totalItemWeightDisplay = totalItemWeightGrams >= 1000 
          ? `${(totalItemWeightGrams / 1000).toFixed(1)} kg` 
          : `${totalItemWeightGrams} g`;

        itemRow.innerHTML = `
          <div class="flex items-center space-x-3 min-w-0 pr-2">
            <input 
              type="checkbox" 
              class="custom-checkbox shrink-0" 
              data-item-id="${item.id}" 
              ${item.checked ? 'checked' : ''}
            >
            <div class="min-w-0">
              <div class="flex items-center space-x-2 flex-wrap">
                <span class="item-name font-medium text-slate-800 text-sm truncate">${item.name}</span>
                <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                  ${item.quantity} ${item.unit || 'ชิ้น'}
                </span>
                <span class="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0" title="น้ำหนักโดยประมาณ">
                  <i class="fa-solid fa-weight-hanging text-[9px] mr-1 text-slate-400"></i>${totalItemWeightDisplay}
                </span>
                ${item.isEssential ? '<span class="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">จำเป็น</span>' : ''}
              </div>
              ${item.reason ? `<div class="text-[11px] text-slate-400 truncate mt-0.5"><i class="fa-solid fa-circle-info text-[9px] mr-1 text-slate-300"></i>${item.reason}</div>` : ''}
            </div>
          </div>

          <div class="flex items-center space-x-1 shrink-0 no-print">
            <button class="btn-delete-item p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition" title="ลบรายการ" data-item-id="${item.id}">
              <i class="fa-regular fa-trash-can text-xs"></i>
            </button>
          </div>
        `;

        // Checkbox change listener
        const checkbox = itemRow.querySelector('.custom-checkbox');
        checkbox.addEventListener('change', (e) => {
          this.toggleItemChecked(item.id, e.target.checked);
        });

        // Delete button listener
        const btnDelete = itemRow.querySelector('.btn-delete-item');
        btnDelete.addEventListener('click', () => {
          this.deleteItem(item.id);
        });

        itemsContainer.appendChild(itemRow);
      });

      this.dom.categoriesContainer.appendChild(catCard);
    });

    if (renderedCategoriesCount === 0) {
      this.dom.categoriesContainer.innerHTML = `
        <div class="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400 text-sm">
          <i class="fa-regular fa-circle-check text-2xl text-emerald-400 mb-2"></i>
          <p>ไม่มีรายการที่ตรงกับตัวกรองนี้</p>
        </div>
      `;
    }
  }

  toggleItemChecked(itemId, isChecked) {
    const item = this.state.items.find(i => i.id === itemId);
    if (item) {
      item.checked = isChecked;
      this.updateProgress();
      this.updateLuggageWeight();
      this.persistCurrentTrip();

      // Update card visual class
      const card = document.querySelector(`.custom-checkbox[data-item-id="${itemId}"]`)?.closest('.item-card');
      if (card) {
        if (isChecked) card.classList.add('checked');
        else card.classList.remove('checked');
      }

      // If active filter is unpacked/packed, re-render list
      if (this.state.filter !== 'all') {
        this.renderChecklist();
      }
    }
  }

  deleteItem(itemId) {
    this.state.items = this.state.items.filter(i => i.id !== itemId);
    this.updateProgress();
    this.updateLuggageWeight();
    this.persistCurrentTrip();
    this.renderChecklist();
    this.showToast('ลบรายการเรียบร้อยแล้ว', 'info');
  }

  setAllItemsChecked(checkedState) {
    this.state.items.forEach(item => item.checked = checkedState);
    this.updateProgress();
    this.updateLuggageWeight();
    this.persistCurrentTrip();
    this.renderChecklist();
    this.showToast(checkedState ? 'ติ๊กทุกรายการแล้ว' : 'ยกเลิกการติ๊กทั้งหมดแล้ว', 'info');
  }

  updateProgress() {
    const total = this.state.items.length;
    const packed = this.state.items.filter(i => i.checked).length;
    const percent = total === 0 ? 0 : Math.round((packed / total) * 100);

    this.dom.progressPercent.textContent = `${percent}%`;
    this.dom.progressCount.textContent = `จัดแล้ว ${packed} / ${total} ชิ้น`;
    this.dom.progressBarFill.style.width = `${percent}%`;

    // Visual color shift when 100%
    if (percent === 100 && total > 0) {
      this.dom.progressBarFill.className = 'progress-bar-fill bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full';
      this.dom.progressPercent.className = 'text-2xl font-black text-emerald-600';
    } else {
      this.dom.progressBarFill.className = 'progress-bar-fill bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full';
      this.dom.progressPercent.className = 'text-2xl font-black text-blue-600';
    }
  }

  updateFilterTabsUI() {
    this.dom.filterTabs.forEach(tab => {
      if (tab.dataset.filter === this.state.filter) {
        tab.className = 'filter-tab px-3 py-1.5 rounded-lg transition bg-white text-slate-900 shadow-sm font-semibold';
      } else {
        tab.className = 'filter-tab px-3 py-1.5 rounded-lg transition text-slate-600 hover:text-slate-900 font-medium';
      }
    });
  }

  handleAddCustomItem(e) {
    e.preventDefault();
    const name = this.dom.addItemName.value.trim();
    const quantity = parseInt(this.dom.addItemQty.value, 10) || 1;
    const unit = this.dom.addItemUnit.value.trim() || 'ชิ้น';
    const weightGrams = parseInt(this.dom.addItemWeight.value, 10) || 150;
    const category = this.dom.addItemCategory.value;
    const reason = this.dom.addItemReason.value.trim();

    if (!name) return;

    const newItem = {
      id: `item_custom_${Date.now()}`,
      name,
      quantity,
      unit,
      category,
      checked: false,
      reason: reason || 'เพิ่มโดยผู้ใช้',
      isEssential: false,
      custom: true,
      weightGrams
    };

    this.state.items.unshift(newItem);
    this.updateProgress();
    this.updateLuggageWeight();
    this.persistCurrentTrip();
    this.renderChecklist();

    // Reset form & close modal
    this.dom.formAddItem.reset();
    this.dom.addItemQty.value = '1';
    this.dom.addItemUnit.value = 'ชิ้น';
    this.dom.addItemWeight.value = '150';
    this.dom.modalAddItem.classList.add('hidden');
    this.showToast(`เพิ่ม "${name}" (${weightGrams}g) ลงในรายการแล้ว`, 'success');
  }

  persistCurrentTrip() {
    const payload = {
      destination: this.state.selectedCity,
      days: this.state.days,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      weather: this.state.weather,
      items: this.state.items,
      baggage: this.state.baggage
    };
    StorageService.saveCurrentTrip(payload);
  }

  restoreTrip(tripData) {
    this.state.selectedCity = tripData.destination;
    this.state.days = tripData.days || 4;
    this.state.startDate = tripData.startDate || this.formatDateYMD(new Date());
    this.state.endDate = tripData.endDate || this.formatDateYMD(new Date(Date.now() + 3 * 86400000));
    this.state.weather = tripData.weather;
    this.state.items = tripData.items || [];
    if (tripData.baggage) {
      this.state.baggage = { ...this.state.baggage, ...tripData.baggage };
      this.dom.selectBaggagePreset.value = this.state.baggage.presetId || 'checked_20';
      this.dom.checkWeightPackedOnly.checked = !!this.state.baggage.packedOnly;
    }

    if (this.state.selectedCity) {
      this.dom.inputCity.value = `${this.state.selectedCity.name}, ${this.state.selectedCity.country}`;
      this.dom.btnClearCity.classList.remove('hidden');
    }

    this.dom.inputStartDate.value = this.state.startDate;
    this.dom.inputEndDate.value = this.state.endDate;
    this.dom.displayDays.textContent = this.state.days;

    if (this.state.weather) {
      this.updateLuggageWeight();
      this.renderWeatherDashboard();
      this.renderChecklist();
      this.updateProgress();

      this.dom.emptyState.classList.add('hidden');
      this.dom.weatherSection.classList.remove('hidden');
      this.dom.weightSection.classList.remove('hidden');
      this.dom.checklistSection.classList.remove('hidden');
    }
  }

  resetAll() {
    StorageService.clearCurrentTrip();
    this.state.selectedCity = null;
    this.state.weather = null;
    this.state.items = [];
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 3);
    this.state.startDate = this.formatDateYMD(today);
    this.state.endDate = this.formatDateYMD(futureDate);
    this.state.days = 4;

    this.dom.inputCity.value = '';
    this.dom.btnClearCity.classList.add('hidden');
    this.dom.inputStartDate.value = this.state.startDate;
    this.dom.inputEndDate.value = this.state.endDate;
    this.dom.displayDays.textContent = this.state.days;

    this.dom.weatherSection.classList.add('hidden');
    this.dom.weightSection.classList.add('hidden');
    this.dom.checklistSection.classList.add('hidden');
    this.dom.emptyState.classList.remove('hidden');
    this.showToast('ล้างรายการทั้งหมดแล้ว', 'info');
  }

  saveTripBookmark() {
    if (!this.state.selectedCity || this.state.items.length === 0) {
      this.showToast('ยังไม่มีข้อมูลทริปที่จะบันทึก', 'error');
      return;
    }

    const tripData = {
      destination: this.state.selectedCity,
      days: this.state.days,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      weather: this.state.weather,
      items: this.state.items,
      baggage: this.state.baggage
    };

    const tripId = StorageService.saveTripToHistory(tripData);
    if (tripId) {
      this.updateSavedTripsBadge();
      this.showToast(`บันทึกทริป ${this.state.selectedCity.name} ลงประวัติเรียบร้อย`, 'success');
    }
  }

  updateSavedTripsBadge() {
    const saved = StorageService.getSavedTrips();
    this.dom.savedTripsCount.textContent = saved.length;
  }

  openHistoryModal() {
    const savedTrips = StorageService.getSavedTrips();
    this.dom.historyTripsList.innerHTML = '';

    if (savedTrips.length === 0) {
      this.dom.historyTripsList.innerHTML = `
        <div class="p-8 text-center text-slate-400 text-sm">
          <i class="fa-regular fa-bookmark text-2xl mb-2 text-slate-300"></i>
          <p>ยังไม่มีทริปที่บันทึกไว้</p>
          <p class="text-xs text-slate-400 mt-1">กดปุ่ม "บันทึกทริปนี้" เพื่อเก็บรายการไว้ดูย้อนหลัง</p>
        </div>
      `;
    } else {
      savedTrips.forEach(trip => {
        const item = document.createElement('div');
        item.className = 'p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 rounded-xl flex items-center justify-between transition group';
        
        const packed = trip.items ? trip.items.filter(i => i.checked).length : 0;
        const total = trip.items ? trip.items.length : 0;
        const dateFormatted = new Date(trip.savedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
        const dateRangeInfo = (trip.startDate && trip.endDate) ? `${this.formatDateThai(trip.startDate)} - ${this.formatDateThai(trip.endDate)}` : `${trip.days} วัน`;
        const weightInfo = trip.baggage ? ` • ⚖️ ${trip.baggage.totalKg || 0} kg` : '';

        item.innerHTML = `
          <div class="cursor-pointer flex-grow pr-3" data-trip-id="${trip.id}">
            <div class="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition flex items-center gap-1.5">
              <i class="fa-solid fa-map-pin text-rose-500 text-xs"></i>
              <span>${trip.title}</span>
            </div>
            <div class="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>📅 ${dateRangeInfo}</span>
              <span>•</span>
              <span class="text-blue-600 font-medium">เก็บแล้ว ${packed}/${total} ชิ้น${weightInfo}</span>
            </div>
          </div>
          <div class="flex items-center space-x-1 shrink-0">
            <button class="btn-load-saved-trip px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition" data-trip-id="${trip.id}">
              เปิดดู
            </button>
            <button class="btn-delete-saved-trip p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition" title="ลบ" data-trip-id="${trip.id}">
              <i class="fa-regular fa-trash-can text-sm"></i>
            </button>
          </div>
        `;

        item.querySelector('.btn-load-saved-trip').addEventListener('click', () => {
          this.restoreTrip(trip);
          this.dom.modalHistory.classList.add('hidden');
          this.showToast(`โหลดทริป ${trip.destination.name} สำเร็จ`, 'success');
        });

        item.querySelector('.btn-delete-saved-trip').addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`ต้องการลบทริป "${trip.title}" ออกจากประวัติ?`)) {
            StorageService.deleteSavedTrip(trip.id);
            this.updateSavedTripsBadge();
            this.openHistoryModal();
          }
        });

        this.dom.historyTripsList.appendChild(item);
      });
    }

    this.dom.modalHistory.classList.remove('hidden');
  }

  copyChecklistText() {
    const tripData = {
      destination: this.state.selectedCity,
      days: this.state.days,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      weather: this.state.weather,
      items: this.state.items,
      baggage: this.state.baggage
    };
    const text = StorageService.generateTextExport(tripData);

    if (!text) {
      this.showToast('ไม่มีรายการสิ่งของสำหรับส่งออก', 'error');
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      this.showToast('คัดลอกรายการและน้ำหนักลงคลิปบอร์ดเรียบร้อยแล้ว!', 'success');
      this.dom.modalExport.classList.add('hidden');
    }).catch(err => {
      console.error(err);
      this.showToast('ไม่สามารถคัดลอกลงคลิปบอร์ดได้', 'error');
    });
  }

  downloadJsonBackup() {
    const tripData = {
      destination: this.state.selectedCity,
      days: this.state.days,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      weather: this.state.weather,
      items: this.state.items,
      baggage: this.state.baggage,
      exportedAt: new Date().toISOString()
    };

    const jsonStr = JSON.stringify(tripData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `packing-list-${this.state.selectedCity?.name || 'trip'}-${this.state.days}days.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.dom.modalExport.classList.add('hidden');
    this.showToast('ดาวน์โหลดไฟล์ JSON เรียบร้อยแล้ว', 'success');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bgColors = {
      success: 'bg-emerald-600 text-white shadow-emerald-500/20',
      error: 'bg-rose-600 text-white shadow-rose-500/20',
      info: 'bg-slate-900 text-white shadow-slate-900/20'
    };

    const icons = {
      success: 'fa-solid fa-circle-check',
      error: 'fa-solid fa-triangle-exclamation',
      info: 'fa-solid fa-circle-info'
    };

    toast.className = `${bgColors[type] || bgColors.info} px-4 py-3 rounded-xl shadow-lg flex items-center space-x-2.5 text-xs sm:text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto`;
    toast.innerHTML = `
      <i class="${icons[type] || icons.info} text-base"></i>
      <span>${message}</span>
    `;

    this.dom.toastContainer.appendChild(toast);

    // Animate In
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Bootstrap Application when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new SmartPackingApp();
});
