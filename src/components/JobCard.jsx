import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

function JobCard({ job, compact = false, showActions = true }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleJobClick = () => {
    navigate(`/jobs/${job._id}`);
  };

  const handleQuickApply = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/login?redirect=' + window.location.pathname);
      return;
    }

    try {
      await apiService.applyForJob({
        jobId: job._id,
        coverLetter: `Tôi quan tâm đến vị trí ${job.title} tại ${job.company?.name}`
      });
      alert('Ứng tuyển thành công!');
    } catch (error) {
      console.error('Quick apply error:', error);
      alert(error.message || 'Ứng tuyển thất bại.');
    }
  };

  const handleSaveJob = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/login?redirect=' + window.location.pathname);
      return;
    }

    try {
      await apiService.saveJob(job._id);
      alert('Đã lưu việc làm!');
    } catch (error) {
      console.error('Save job error:', error);
      alert(error.message || 'Lưu thất bại.');
    }
  };

  if (compact) {
    return (
      <div className="job-card-compact" onClick={handleJobClick}>
        <div className="job-card-header">
          <div className="job-title">{job.title}</div>
          {job.isFeatured && <div className="job-badge">Nổi bật</div>}
        </div>
        <div className="job-company">{job.company?.name}</div>
        <div className="job-meta">
          <span>💰 {job.salary}</span>
          <span>📍 {job.location}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="job-card" onClick={handleJobClick}>
      <div className="job-card-header">
        <div>
          <div className="job-title">{job.title}</div>
          <div className="job-company">{job.company?.name}</div>
        </div>
        {job.isFeatured && <div className="job-badge">Nổi bật</div>}
      </div>
      
      <div className="job-meta">
        <div className="job-meta-item">📍 {job.location}</div>
        <div className="job-meta-item">💰 {job.salary}</div>
        <div className="job-meta-item">🕒 {job.jobType}</div>
        <div className="job-meta-item">
          📅 {new Date(job.createdAt).toLocaleDateString('vi-VN')}
        </div>
      </div>
      
      <div className="job-description">
        {job.description && job.description.length > 100 
          ? `${job.description.substring(0, 100)}...` 
          : job.description
        }
      </div>
      
      <div className="job-tags">
        <span className="job-tag">{job.category}</span>
        {job.skills && job.skills.slice(0, 2).map((skill, index) => (
          <span key={index} className="job-tag">{skill}</span>
        ))}
      </div>
      
      {showActions && (
        <div className="job-card-footer">
          <div className="job-posted">
            Đăng {new Date(job.createdAt).toLocaleDateString('vi-VN')}
          </div>
          <div className="job-actions">
            <button className="btn-save" onClick={handleSaveJob}>
              💚 Lưu
            </button>
            <button className="btn-apply" onClick={handleQuickApply}>
              Ứng tuyển
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobCard;