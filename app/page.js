'use client';

import { useState } from 'react';
import {DB,  Countrys } from '@/db';
import CountryShowcase from '@/components/servesesCountryShowCase/CountryShowcase';
import InstallPWA from '@/components/InstallPWA/InstallPWA';



// گزینه‌های علاقه‌مندی‌ها
const interests_options = [
  { value: 'sightseeing', label: 'Sightseeing', icon: '🏛️' },
  { value: 'restaurant', label: 'Restaurants', icon: '🍽️' },
  { value: 'concert', label: 'Concerts', icon: '🎵' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'museum', label: 'Museums', icon: '🖼️' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'nature', label: 'Nature', icon: '🌲' },
  { value: 'nightlife', label: 'Nightlife', icon: '🌃' }
];

// تابع کمکی برای آیکون دسته‌بندی‌ها
const getCategoryIcon = (category) => {
  const icons = {
    'activities': '🎯',
    'restaurant': '🍽️',
    'shopping': '🛍️',
    'museum': '🖼️',
    'theme-park': '🎢',
    'park': '🌳',
    'nightlife': '🌃',
    'landmark': '🏛️'
  };
  return icons[category] || '📍';
};

// تابع کمکی برای نمایش ستاره‌های امتیاز
const getRatingStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = '⭐'.repeat(fullStars);
  if (hasHalfStar) stars += '✨';
  return stars;
};

export default function Home() {
  // استیت‌های فرم
  const [formData, setFormData] = useState({
    country: '',
    city: '',
    budget: '',
    age: '',
    gender: 'male',
    interests: [],
    date: ''
  });

  // استیت‌های UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOfflineData, setIsOfflineData] = useState(false);

  // هندلر تغییر input ها
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  // هندلر تغییر علاقه‌مندی‌ها
  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
    if (error) setError('');
  };

  // فیلتر کردن توصیه‌ها بر اساس بودجه و علاقه‌مندی‌ها
  const filterRecommendations = (data, userBudget, userInterests) => {
    const budget = parseInt(userBudget, 10);
    
    // فیلتر بر اساس بودجه
    let filtered = data.recommendations.filter(item => {
      const price = item.price_numeric || 0;
      return price <= budget || price === 0; // رایگان یا کمتر از بودجه
    });

    // مرتب‌سازی بر اساس علاقه‌مندی‌ها
    filtered = filtered.sort((a, b) => {
      const aMatches = userInterests.some(interest => 
        a.category?.includes(interest) || 
        a.type?.includes(interest) ||
        a.famous_for?.toLowerCase().includes(interest)
      );
      const bMatches = userInterests.some(interest => 
        b.category?.includes(interest) || 
        b.type?.includes(interest) ||
        b.famous_for?.toLowerCase().includes(interest)
      );
      
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      
      // اگر هر دو مطابقت داشتند یا نداشتند، بر اساس امتیاز مرتب کن
      return b.rating - a.rating;
    });

    // حداکثر 10 مورد برتر
    return filtered.slice(0, 10);
  };

  // هندلر ارسال فرم
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // اعتبارسنجی
    if (formData.interests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setError('');
    setLoading(true);
    setApiResponse(null);
    setIsOfflineData(false);

    const requestData = {
      country: formData.country.trim(),
      city: formData.city.trim(),
      budget: parseInt(formData.budget, 10),
      age: parseInt(formData.age, 10),
      gender: formData.gender,
      interests: formData.interests,
      date: formData.date
    };

    try {
      const response = await fetch('http://95.217.0.241:8888/api/recommendations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer xl_qQ4vxQd7NgBxv501cnHS5JCyTJJTJ8txjUS0-JVc',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setApiResponse(data);
      setIsModalOpen(true);

    } catch (err) {
      console.error('Error:', err);
      
      // استفاده از داده‌های آفلاین
      const offlineData = DB();
      
      // فیلتر و شخصی‌سازی داده‌ها بر اساس ورودی کاربر
      const filteredRecommendations = filterRecommendations(
        offlineData, 
        formData.budget, 
        formData.interests
      );
      
      // ساخت پاسخ شخصی‌سازی شده
      const customizedResponse = {
        ...offlineData,
        recommendations: filteredRecommendations,
        user_input: requestData,
        offline_mode: true,
        message: `Offline recommendations for ${formData.city || 'Berlin'}`
      };
      
      setApiResponse(customizedResponse);
      setIsOfflineData(true);
      setIsModalOpen(true);
      
      // نمایش پیام خطا
      setError(
        <div className="flex items-center gap-2">
          <span className="text-yellow-500">⚠️</span>
          <span>Connection failed. Showing offline recommendations</span>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  // بستن مودال
  const closeModal = () => {
    setIsModalOpen(false);
  };


  console.log(DB());
  console.log(Countrys());
  
  
  return (
    <>
        <InstallPWA/>
    {/* CountryShowcase */}
    <CountryShowcase/>

    {/* form start */}
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 py-8 px-4 sm:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header - برند و شعار اصلی */}
          <div className="text-center mb-8 animate-fade-in">
            {/* لوگو */}
            <div className="mb-4">
              <span className="text-5xl md:text-6xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 text-gradient">
                fex<span className="text-indigo-500">trip</span>
              </span>
              <span className="text-2xl ml-2">✈️</span>
            </div>
            
            {/* شعار اصلی */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Smart Travel Planning Made Simple
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Don’t know where to go? 
Just enter your country, budget, and interests — we’ll smartly suggest your next travel destination  🌍
            </p>
            
            {/* نوار ویژگی‌ها */}
            <div className="flex justify-center gap-6 mt-6 text-sm">
              <span className="flex items-center gap-1 text-gray-600">
                <span className="text-green-500">✓</span> Easy Planning
              </span>
              <span className="flex items-center gap-1 text-gray-600">
                <span className="text-green-500">✓</span> Personalized
              </span>
              <span className="flex items-center gap-1 text-gray-600">
                <span className="text-green-500">✓</span> Budget-Friendly
              </span>
            </div>
          </div>

          {/* Main Form Card - کارت اصلی فرم */}
          <div className="glass bg-white/90 rounded-3xl shadow-2xl shadow-violet-500/10 p-6 sm:p-10 border border-purple-100 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* بخش مقصد: کشور و شهر */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-violet-600">1.</span>
                  Where do you want to go?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-violet-600 transition-colors">
                      <span className="inline-block ml-1">🌏</span>
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="e.g., Germany"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all duration-300 hover:border-gray-300"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-violet-600 transition-colors">
                      <span className="inline-block ml-1">🏙️</span>
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g., Berlin"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all duration-300 hover:border-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* بخش اطلاعات شخصی: بودجه و سن */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-violet-600">2.</span>
                  Tell us about yourself
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-violet-600 transition-colors">
                      <span className="inline-block ml-1">💰</span>
                      Daily Budget (EUR)
                    </label>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="e.g., 150"
                      required
                      min="1"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all duration-300 hover:border-gray-300"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-violet-600 transition-colors">
                      <span className="inline-block ml-1">👤</span>
                      Your Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="e.g., 28"
                      required
                      min="1"
                      max="120"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all duration-300 hover:border-gray-300"
                    />
                  </div>
                </div>

                {/* جنسیت و تاریخ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-violet-600 transition-colors">
                      <span className="inline-block ml-1">⚧</span>
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all duration-300 hover:border-gray-300 cursor-pointer"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-violet-600 transition-colors">
                      <span className="inline-block ml-1">📅</span>
                      Travel Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all duration-300 hover:border-gray-300 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* بخش علاقه‌مندی‌ها */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-violet-600">3.</span>
                  What are your interests?
                  <span className="text-xs text-gray-500 font-normal">(Select at least one)</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {interests_options.map(interest => (
                    <label
                      key={interest.value}
                      className={`
                        relative flex items-center justify-center p-3 rounded-xl cursor-pointer
                        transition-all duration-300 border-2 hover:scale-105
                        ${formData.interests.includes(interest.value)
                          ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white border-transparent shadow-lg shadow-violet-500/30 scale-105'
                          : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-violet-300 text-gray-700'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={formData.interests.includes(interest.value)}
                        onChange={() => handleInterestToggle(interest.value)}
                        className="sr-only"
                      />
                      <span className="flex flex-col items-center gap-1">
                        <span className="text-xl">{interest.icon}</span>
                        <span className="text-xs font-medium">{interest.label}</span>
                      </span>
                      {formData.interests.includes(interest.value) && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center animate-zoom-in">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* نمایش خطا */}
              {error && (
                <div className={`${typeof error === 'string' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'} border-2 px-4 py-3 rounded-xl animate-slide-down`}>
                  {error}
                </div>
              )}

              {/* دکمه ارسال */}
              <button
                type="submit"
                disabled={loading}
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-white text-lg
                  transition-all duration-300 transform flex items-center justify-center gap-3
                  ${loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/25'
                  }
                `}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing your trip...
                  </>
                ) : (
                  <>
                    <span>Get Smart Recommendations</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* پیام پایین فرم */}
            <div className="text-center mt-6 text-sm text-gray-500">
              <p>🔒 Your data is safe with <span className="font-semibold text-violet-600">fextrip</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal نمایش نتایج */}
      {isModalOpen && apiResponse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-zoom-in">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-5 flex justify-between items-center shadow-lg z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✈️</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Your fextrip Recommendations</h2>
                  {isOfflineData && (
                    <p className="text-sm text-white/80 flex items-center gap-1">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                      Offline Mode
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:rotate-90"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] scrollbar-thin">
              {apiResponse.recommendations && apiResponse.recommendations.length > 0 ? (
                <div className="space-y-6">
                  {/* اطلاعات سفر */}
                  {apiResponse.user_input && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Your Trip Details</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-600">📍 Destination</p>
                          <p className="font-bold text-purple-700">
                            {apiResponse.user_input.city}, {apiResponse.user_input.country}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">💰 Budget</p>
                          <p className="font-bold text-purple-700">€{apiResponse.user_input.budget}/day</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">📅 Date</p>
                          <p className="font-bold text-purple-700">{apiResponse.user_input.date}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">👤 Age</p>
                          <p className="font-bold text-purple-700">{apiResponse.user_input.age} years</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* عنوان بخش پیشنهادات */}
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-violet-600">🎯</span>
                    Top Recommendations for You
                  </h3>

                  {/* کارت‌های پیشنهادات */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {apiResponse.recommendations.map((item, idx) => (
                      <div 
                        key={item.id || idx} 
                        className="card bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                      >
                        {/* تصویر */}
                        {item.image && (
                          <div className="h-48 bg-gradient-to-br from-violet-400 to-indigo-500 relative">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover opacity-80"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg">
                              <span className="text-sm font-bold">#{item.rank}</span>
                            </div>
                          </div>
                        )}
                        
                        {/* محتوا */}
                        <div className="p-4">
                          {/* عنوان و امتیاز */}
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                              <span>{getCategoryIcon(item.category)}</span>
                              {item.name}
                            </h3>
                            {item.rating > 0 && (
                              <div className="text-sm">
                                <span className="text-yellow-500">{getRatingStars(item.rating)}</span>
                                <span className="text-gray-600 ml-1">{item.rating}</span>
                              </div>
                            )}
                          </div>

                          {/* توضیحات */}
                          <p className="text-sm text-gray-600 mb-3">{item.description || item.summary}</p>

                          {/* اطلاعات اضافی */}
                          <div className="space-y-2">
                            {/* قیمت */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">💰 Cost:</span>
                              <span className="text-sm font-semibold text-green-600">
                                {item.price_numeric === 0 ? 'Free' : item.price || 'Unknown'}
                              </span>
                            </div>

                            {/* آدرس */}
                            {item.address && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">📍 Address:</span>
                                <span className="text-xs text-gray-700">{item.address}</span>
                              </div>
                            )}

                            {/* تگ‌ها */}
                            {item.famous_for && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.famous_for.split(',').map((tag, i) => (
                                  <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                    {tag.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* دکمه‌ها */}
                          <div className="flex gap-2 mt-4">
                            {item.website && (
                              <a 
                                href={item.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 btn bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm py-2 rounded-lg hover:shadow-lg"
                              >
                                🌐 Website
                              </a>
                            )}
                            {item.google_url && (
                              <a 
                                href={item.google_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 btn bg-gray-100 text-gray-700 text-sm py-2 rounded-lg hover:bg-gray-200"
                              >
                                🗺️ Map
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* پیام آفلاین */}
                  {isOfflineData && (
                    <div className="mt-6 bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                      <p className="text-amber-700 text-sm flex items-center gap-2">
                        <span>💡</span>
                        These recommendations are filtered based on your €{apiResponse.user_input.budget} budget and selected interests.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* نمایش JSON خام */
                <div className="bg-gray-900 rounded-2xl p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400 font-mono">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 border-t border-gray-200 px-6 py-4 bg-white/95 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {apiResponse.recommendations && (
                    <span>{apiResponse.recommendations.length} recommendations found by <span className="font-semibold text-violet-600">fextrip</span></span>
                  )}
                </div>
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all hover:shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* form end */}
    </>
  );
}