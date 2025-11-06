// components/CountryShowcase.jsx
'use client';

import { useState, useEffect } from 'react';
import { Countrys } from '@/db';

const CountryShowcase = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // فراخوانی دیتا از دیتابیس
    const data = Countrys();
    setCountries(data);
  }, []);

  // فیلتر کردن کشورها بر اساس جستجو
  const filteredCountries = countries.filter(country => 
    country.CountryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.citys.some(city => city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // آیکون‌های کشورها (می‌توانید تغییر دهید)
  const getCountryIcon = (countryName) => {
    const icons = {
      'Germany': '🇩🇪',
      'Netherlands': '🇳🇱', 
      'France': '🇫🇷',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸'
    };
    return icons[countryName] || '🌍';
  };

  // گرادیانت‌های مختلف برای کارت‌ها
  const getGradientClass = (index) => {
    const gradients = [
      'bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600',
      'bg-gradient-to-br from-accent-violet via-accent-purple to-accent-indigo',
      'bg-gradient-to-br from-accent-blue via-accent-indigo to-secondary-500',
      'bg-gradient-to-br from-accent-emerald via-accent-green to-accent-blue',
      'bg-gradient-to-br from-accent-orange via-accent-yellow to-accent-orange'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-slide-down">
          <h1 className="text-5xl lg:text-7xl font-display font-bold mb-6">
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-gradient">
              مقاصد دلپذیر
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            با ما سفری رویایی را در کشورهای اروپایی تجربه کنید. از میان شهرهای زیبا و دیدنی مقصد دلخواهتان را انتخاب کنید
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-10 animate-slide-up">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی کشور یا شهر..."
              className="w-full pr-12 pl-6 py-4 text-base bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-400/30 focus:border-primary-400 transition-all duration-300"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'کشور', value: countries.length, icon: '🌍' },
            { label: 'شهر', value: countries.reduce((acc, c) => acc + c.citys.length, 0), icon: '🏙️' },
            { label: 'تور فعال', value: '250+', icon: '✈️' },
            { label: 'مسافر راضی', value: '10K+', icon: '😊' }
          ].map((stat, index) => (
            <div
              key={index}
              className="glass rounded-2xl p-6 text-center animate-zoom-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {stat.value}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Countries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredCountries.map((country, index) => (
            <div
              key={country.CountryName}
              className="group relative animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredCard(country.CountryName)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => setSelectedCountry(
                selectedCountry === country.CountryName ? null : country.CountryName
              )}
            >
              <div className={`
                relative overflow-hidden rounded-3xl shadow-xl transition-all duration-500 cursor-pointer
                ${hoveredCard === country.CountryName ? 'scale-105 shadow-2xl' : ''}
                ${selectedCountry === country.CountryName ? 'ring-4 ring-primary-400' : ''}
              `}>
                
                {/* Background Gradient */}
                <div className={`absolute inset-0 ${getGradientClass(index)} opacity-90`} />
                
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full animate-pulse-slow" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full animate-ping-slow" />
                </div>

                {/* Content */}
                <div className="relative p-8 text-white">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-5xl mb-3 animate-bounce-slow">
                        {getCountryIcon(country.CountryName)}
                      </div>
                      <h3 className="text-2xl font-bold mb-1">
                        {country.CountryName}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {country.citys.length} شهر گردشگری
                      </p>
                    </div>
                    <div className={`
                      transition-transform duration-300
                      ${selectedCountry === country.CountryName ? 'rotate-180' : ''}
                    `}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Cities */}
                  <div className={`
                    grid grid-cols-2 gap-2 transition-all duration-500 overflow-hidden
                    ${selectedCountry === country.CountryName ? 'max-h-96 opacity-100' : 'max-h-20 opacity-70'}
                  `}>
                    {country.citys.map((city, cityIndex) => (
                      <div
                        key={cityIndex}
                        className={`
                          bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium
                          transition-all duration-300 hover:bg-white/30 hover:scale-105
                          ${selectedCountry === country.CountryName ? 'animate-slide-up' : ''}
                        `}
                        style={{
                          animationDelay: `${cityIndex * 50}ms`
                        }}
                      >
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {city}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <div className="mt-6 flex items-center justify-between">
                    <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105">
                      مشاهده تورها
                    </button>
                    <div className="flex items-center gap-1 text-sm">
                      <span>از</span>
                      <span className="text-lg font-bold">۳.۵M</span>
                      <span>تومان</span>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Glow */}
                {hoveredCard === country.CountryName && (
                  <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none animate-pulse" />
                )}
              </div>

              {/* Popular Badge */}
              {index === 0 && (
                <div className="absolute -top-3 -right-3 bg-accent-yellow text-neutral-900 px-3 py-1 rounded-full text-xs font-bold animate-wiggle z-10">
                  محبوب‌ترین
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCountries.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
              موردی یافت نشد
            </h3>
            <p className="text-neutral-500 dark:text-neutral-500">
              لطفاً عبارت دیگری را جستجو کنید
            </p>
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4 items-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-8 rounded-3xl shadow-2xl">
            <div className="text-right">
              <h3 className="text-2xl font-bold mb-2">آماده سفر هستید؟</h3>
              <p className="text-white/90">همین حالا فرم را پر کنید و بهترین پیشنهاد را دریافت کنید</p>
            </div>
            <button className="bg-white text-primary-600 px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg">
              شروع برنامه‌ریزی سفر
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryShowcase;