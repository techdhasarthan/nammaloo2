// lib/mockApi.js

import { mockToilets } from './mockData';

export async function getAllToilets() {
  return mockToilets;
}

export async function getTopRated(count = 5) {
  return mockToilets.sort((a, b) => b.rating - a.rating).slice(0, count);
}

export async function testConnection() {
  return { success: true };
}

export async function searchForToilets(query) {
  return mockToilets.filter((toilet) =>
    toilet.name.toLowerCase().includes(query.toLowerCase())
  );
}
