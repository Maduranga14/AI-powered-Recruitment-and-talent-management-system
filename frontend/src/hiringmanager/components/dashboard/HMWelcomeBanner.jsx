import React from 'react';

export default function HMWelcomeBanner() {
  return (
    <div>
      <h1 className="text-[26px] font-bold text-gray-900">Good afternoon, Zam !</h1>
      <p className="text-gray-500 text-[14px] mt-1">
        Your AI-powered talent insights are ready. You have{' '}
        <span className="text-teal-600 font-semibold cursor-pointer hover:underline">3 new priority candidates</span>{' '}
        to review today.
      </p>
    </div>
  );
}
