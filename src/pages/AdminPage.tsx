import React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import AdminNav from '../components/admin/AdminNav';

export default function AdminPage() {
  return (
    <>
      <AdminNav />
      <main>
        <Outlet />
      </main>
    </>
  );
}
