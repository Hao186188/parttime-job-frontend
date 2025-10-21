import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './EmployerDashboard.css';
import apiService from '../services/api';

function EmployerDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    activeJobs: 0,
    newApplications: 0
  });
  const [showJobModal, setShowJobModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    jobType: 'Bán thời gian',
    description: '',
    requirements: '',
    benefits: '',
    contact: '',
    deadline: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
  // Check if user data exists in localStorage
  const user = apiService.getCurrentUserData();
  
  if (!user || user.userType !== 'employer') {
    // Try to get current user from API
    try {
      const response = await apiService.getCurrentUser();
      if (response.data.user.userType !== 'employer') {
        navigate('/login?redirect=employer');
        return;
      }
      setCurrentUser(response.data.user);
    } catch (error) {
      navigate('/login?redirect=employer');
      return;
    }
  } else {
    setCurrentUser(user);
  }
};
    loadDashboardData();
  }, []);

  const checkAuth = () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.userType !== 'employer') {
      navigate('/login?redirect=employer');
      return;
    }
    setCurrentUser(user);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load employer's jobs
      const jobsResponse = await apiService.getEmployerJobs();
      setJobs(jobsResponse.data.jobs || []);

      // Load applications
      const appsResponse = await apiService.getEmployerApplications();
      setApplications(appsResponse.data.applications || []);

      // Calculate stats
      const totalJobs = jobsResponse.data.jobs?.length || 0;
      const totalApplications = appsResponse.data.applications?.length || 0;
      const activeJobs = jobsResponse.data.jobs?.filter(job => job.isActive).length || 0;
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newApplications = appsResponse.data.applications?.filter(app => 
        new Date(app.appliedAt) > oneWeekAgo
      ).length || 0;

      setStats({
        totalJobs,
        totalApplications,
        activeJobs,
        newApplications
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      alert('Lỗi khi tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.createJob(jobForm);
      setShowJobModal(false);
      setJobForm({
        title: '',
        company: '',
        location: '',
        salary: '',
        jobType: 'Bán thời gian',
        description: '',
        requirements: '',
        benefits: '',
        contact: '',
        deadline: ''
      });
      loadDashboardData();
      alert('Đăng tin tuyển dụng thành công!');
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Lỗi khi đăng tin tuyển dụng');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await apiService.updateApplicationStatus(applicationId, { status });
      loadDashboardData();
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  if (loading) {
    return (
      <div className="employer-dashboard">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employer-dashboard">
      {/* Header */}
      <header>
        <div className="container">
          <div className="logo">
            <h1><Link to="/">PartTimeJob</Link></h1>
            <p>Việc làm bán thời gian cho học sinh, sinh viên</p>
          </div>
          <nav>
            <ul>
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/jobs">Tìm việc</Link></li>
              <li><Link to="/employer/dashboard" className="active">Nhà tuyển dụng</Link></li>
              <li className="user-menu">
                <span className="user-name">
                  {currentUser?.name || 'Tài khoản'}
                </span>
                <div className="user-dropdown">
                  <button onClick={handleLogout}>Đăng xuất</button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Dashboard Content */}
      <section className="dashboard-content">
        <div className="container">
          <div className="dashboard-header">
            <h1>Quản lý tuyển dụng</h1>
            <p>Quản lý tin tuyển dụng và ứng viên của bạn</p>
            <button 
              className="btn-primary"
              onClick={() => setShowJobModal(true)}
            >
              Đăng tin tuyển dụng mới
            </button>
          </div>

          {/* Stats Overview */}
          <div className="stats-overview">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h3>{stats.totalJobs}</h3>
                <p>Tin đã đăng</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📨</div>
              <div className="stat-info">
                <h3>{stats.totalApplications}</h3>
                <p>Đơn ứng tuyển</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>{stats.activeJobs}</h3>
                <p>Tin đang hoạt động</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <h3>{stats.newApplications}</h3>
                <p>Đơn mới</p>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="content-section">
            <div className="section-header">
              <h2>Tin tuyển dụng của bạn</h2>
              <button className="btn-secondary" onClick={loadDashboardData}>
                Làm mới
              </button>
            </div>
            
            <div className="jobs-list">
              {jobs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">💼</div>
                  <h3>Chưa có tin tuyển dụng</h3>
                  <p>Bắt đầu bằng cách đăng tin tuyển dụng đầu tiên!</p>
                </div>
              ) : (
                jobs.map(job => (
                  <div key={job._id} className="job-item-employer">
                    <div className="job-header-employer">
                      <div>
                        <div className="job-title-employer">{job.title}</div>
                        <div className="job-meta">
                          <span>📍 {job.location}</span>
                          <span>💰 {job.salary}</span>
                          <span>🕒 {new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                      <div className="job-actions">
                        <span className="job-status">
                          {job.isActive ? '🟢 Đang hoạt động' : '🔴 Đã đóng'}
                        </span>
                      </div>
                    </div>
                    <div className="job-stats">
                      <div className="job-stat">
                        📨 {job.applicationStats?.pending || 0} đơn chờ xem xét
                      </div>
                      <div className="job-stat">
                        👥 {job.applicationCount || 0} ứng viên
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="content-section">
            <div className="section-header">
              <h2>Đơn ứng tuyển gần đây</h2>
            </div>
            
            <div className="applications-list">
              {applications.slice(0, 5).map(application => (
                <div key={application._id} className="application-item">
                  <div className="application-header">
                    <div>
                      <div className="applicant-name">{application.applicant?.name}</div>
                      <div className="application-job">{application.job?.title}</div>
                      <div className="application-meta">
                        <span>📅 {new Date(application.appliedAt).toLocaleDateString('vi-VN')}</span>
                        <span>📧 {application.applicant?.email}</span>
                      </div>
                    </div>
                    <select
                      value={application.status}
                      onChange={(e) => updateApplicationStatus(application._id, e.target.value)}
                      className={`status-select status-${application.status}`}
                    >
                      <option value="pending">Chờ xem xét</option>
                      <option value="reviewed">Đã xem xét</option>
                      <option value="shortlisted">Đã duyệt</option>
                      <option value="rejected">Từ chối</option>
                    </select>
                  </div>
                </div>
              ))}
              {applications.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">📨</div>
                  <h3>Chưa có đơn ứng tuyển</h3>
                  <p>Đăng tin tuyển dụng để nhận đơn từ ứng viên</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Job Posting Modal */}
      {showJobModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Đăng tin tuyển dụng mới</h3>
              <button 
                className="modal-close"
                onClick={() => setShowJobModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleJobSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Chức danh công việc *</label>
                    <input
                      type="text"
                      value={jobForm.title}
                      onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên công ty *</label>
                    <input
                      type="text"
                      value={jobForm.company}
                      onChange={(e) => setJobForm({...jobForm, company: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Địa điểm làm việc *</label>
                    <select
                      value={jobForm.location}
                      onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                      required
                    >
                      <option value="">Chọn địa điểm</option>
                      <option value="hanoi">Hà Nội</option>
                      <option value="hcm">TP. Hồ Chí Minh</option>
                      <option value="danang">Đà Nẵng</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Mức lương *</label>
                    <input
                      type="text"
                      value={jobForm.salary}
                      onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
                      placeholder="VD: 25,000 - 30,000 VNĐ/giờ"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Mô tả công việc *</label>
                  <textarea
                    value={jobForm.description}
                    onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                    rows="5"
                    required
                  />
                </div>
                
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowJobModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary">
                    Đăng tin
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>QTM3-K14</h3>
              <p>Kết nối học sinh, sinh viên với các công việc bán thời gian phù hợp.</p>
            </div>
            <div className="footer-section">
              <h4>Liên kết nhanh</h4>
              <ul>
                <li><Link to="/">Trang chủ</Link></li>
                <li><Link to="/jobs">Tìm việc</Link></li>
                <li><Link to="/employer/dashboard">Nhà tuyển dụng</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Hỗ trợ</h4>
              <ul>
                <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
                <li><Link to="/contact">Liên hệ</Link></li>
                <li><Link to="/terms">Điều khoản sử dụng</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Theo dõi chúng tôi</h4>
              <div className="social-links">
                <a href="https://facebook.com/share/17PfiN1Xrk/" target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
                <a href="https://zalo.me/0924091201" target="_blank" rel="noopener noreferrer">
                  Zalo
                </a>
                <a href="mailto:contact@parttimejob.com">Email</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 QTM3-K14. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default EmployerDashboard;