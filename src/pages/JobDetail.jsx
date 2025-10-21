import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import './JobDetail.css';
import apiService from '../services/api';

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadJobDetail();
  }, [id]);

  const loadJobDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getJob(id);
      setJob(response.data.job);
      loadSimilarJobs(response.data.job);
    } catch (error) {
      console.error('Error loading job detail:', error);
      setError('Không thể tải thông tin công việc');
    } finally {
      setLoading(false);
    }
  };

  const loadSimilarJobs = async (currentJob) => {
    try {
      const response = await apiService.getJobs({
        category: currentJob.category,
        location: currentJob.location,
        limit: 3
      });
      // Filter out current job
      const filteredJobs = response.data.jobs.filter(j => j._id !== currentJob._id);
      setSimilarJobs(filteredJobs.slice(0, 3));
    } catch (error) {
      console.error('Error loading similar jobs:', error);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login?redirect=' + window.location.pathname);
      return;
    }

    try {
      await apiService.applyForJob({
        jobId: job._id,
        coverLetter: `Tôi quan tâm đến vị trí ${job.title} tại ${job.company?.name}`
      });
      alert('Ứng tuyển thành công! Nhà tuyển dụng sẽ liên hệ với bạn sớm.');
    } catch (error) {
      console.error('Application error:', error);
      alert(error.message || 'Ứng tuyển thất bại. Vui lòng thử lại.');
    }
  };

  const handleSaveJob = async () => {
    if (!user) {
      navigate('/login?redirect=' + window.location.pathname);
      return;
    }

    try {
      await apiService.saveJob(job._id);
      alert('Đã lưu việc làm thành công!');
    } catch (error) {
      console.error('Save job error:', error);
      alert(error.message || 'Lưu việc làm thất bại.');
    }
  };

  const handleShare = () => {
    const jobUrl = window.location.href;
    navigator.clipboard.writeText(jobUrl).then(() => {
      alert('Đã copy link chia sẻ vào clipboard!');
    }).catch(() => {
      // Fallback
      const tempInput = document.createElement('input');
      tempInput.value = jobUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      alert('Đã copy link chia sẻ!');
    });
  };

  if (loading) {
    return (
      <div className="job-detail-page">
        <Header />
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin công việc...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="job-detail-page">
        <Header />
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>{error || 'Không tìm thấy công việc'}</h3>
          <p>Công việc không tồn tại hoặc đã bị xóa.</p>
          <Link to="/jobs" className="btn-primary">Quay lại danh sách việc làm</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="job-detail-page">
      <Header />
      
      <section className="job-detail">
        <div className="container">
          <div className="job-detail-content">
            {/* Main Content */}
            <div className="job-main">
              <div className="breadcrumb">
                <Link to="/">Trang chủ</Link> &gt;
                <Link to="/jobs">Tìm việc</Link> &gt;
                <span>{job.title}</span>
              </div>
              
              <div className="job-header-detail">
                <div className="job-title-section">
                  <h1>{job.title}</h1>
                  <div className="job-company-detail">{job.company?.name}</div>
                  <div className="job-meta-detail">
                    <span className="job-location">📍 {job.location}</span>
                    <span className="job-salary">💰 {job.salary}</span>
                    <span className="job-type">🕒 {job.jobType}</span>
                    <span className="job-posted">
                      📅 {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                <div className="job-actions-detail">
                  <button className="btn-apply-main" onClick={handleApply}>
                    Ứng tuyển ngay
                  </button>
                  <button className="btn-save-job" onClick={handleSaveJob}>
                    💚 Lưu việc làm
                  </button>
                  <button className="btn-share-job" onClick={handleShare}>
                    📤 Chia sẻ
                  </button>
                </div>
              </div>
              
              <div className="job-content">
                <div className="content-section">
                  <h3>📝 Mô tả công việc</h3>
                  <div className="content-text">
                    {job.description || 'Chưa có mô tả chi tiết.'}
                  </div>
                </div>
                
                {job.requirements && (
                  <div className="content-section">
                    <h3>✅ Yêu cầu công việc</h3>
                    <div className="content-text">{job.requirements}</div>
                  </div>
                )}
                
                {job.benefits && (
                  <div className="content-section">
                    <h3>🎁 Quyền lợi</h3>
                    <div className="content-text">{job.benefits}</div>
                  </div>
                )}
                
                <div className="content-section">
                  <h3>🏢 Về công ty</h3>
                  <div className="company-info">
                    <div className="company-name">{job.company?.name}</div>
                    <div className="company-contact">
                      📧 {job.contactEmail || job.company?.email}
                      {job.contactPhone && ` • 📞 ${job.contactPhone}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="job-sidebar">
              <div className="sidebar-widget company-widget">
                <h3>Thông tin tuyển dụng</h3>
                <div className="info-list">
                  <div className="info-item">
                    <strong>📍 Địa điểm:</strong>
                    <span>{job.location}</span>
                  </div>
                  <div className="info-item">
                    <strong>💰 Mức lương:</strong>
                    <span>{job.salary}</span>
                  </div>
                  <div className="info-item">
                    <strong>🕒 Loại hình:</strong>
                    <span>{job.jobType}</span>
                  </div>
                  <div className="info-item">
                    <strong>📅 Đã đăng:</strong>
                    <span>{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="info-item">
                    <strong>👥 Hạn nộp:</strong>
                    <span>
                      {job.applicationDeadline 
                        ? new Date(job.applicationDeadline).toLocaleDateString('vi-VN')
                        : 'Không xác định'
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="sidebar-widget">
                <h3>Việc làm tương tự</h3>
                <div className="similar-jobs">
                  {similarJobs.length > 0 ? (
                    similarJobs.map(similarJob => (
                      <JobCard key={similarJob._id} job={similarJob} compact={true} />
                    ))
                  ) : (
                    <p className="no-similar-jobs">Không có việc làm tương tự</p>
                  )}
                </div>
              </div>
              
              <div className="sidebar-widget safety-widget">
                <h3>⚠️ Lưu ý an toàn</h3>
                <div className="safety-tips">
                  <p>• Không ứng trước tiền</p>
                  <p>• Gặp mặt tại nơi công cộng</p>
                  <p>• Xác minh thông tin công ty</p>
                  <p>• Báo cáo việc làm đáng ngờ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default JobDetail;