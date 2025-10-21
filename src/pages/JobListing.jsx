import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from '../components/Header';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import "./JobListing.css";

function JobListing() {
  const API_URL = "https://parttime-job-backend.onrender.com/api/jobs";
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [salary, setSalary] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Gọi API lấy danh sách việc làm
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_URL);
        const data = await res.json();
        if (data.data && data.data.jobs) {
          setJobs(data.data.jobs);
          setFilteredJobs(data.data.jobs);
        } else {
          setJobs([]);
          setFilteredJobs([]);
        }
      } catch (err) {
        console.error("Lỗi khi tải việc làm:", err);
        setError("Không thể tải danh sách việc làm");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Xử lý lọc & tìm kiếm
  useEffect(() => {
    let result = [...jobs];

    if (searchTerm) {
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (location) {
      result = result.filter(
        (job) =>
          job.location &&
          job.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (jobType) {
      result = result.filter((job) => job.jobType === jobType);
    }

    if (salary > 0) {
      result = result.filter((job) => {
        const jobSalary = extractSalary(job.salary);
        return jobSalary >= salary;
      });
    }

    if (selectedCategories.length > 0) {
      result = result.filter((job) =>
        selectedCategories.includes(job.category)
      );
    }

    // Sắp xếp
    switch (sortBy) {
      case "oldest":
        result.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
      case "salary_high":
        result.sort((a, b) => extractSalary(b.salary) - extractSalary(a.salary));
        break;
      case "salary_low":
        result.sort((a, b) => extractSalary(a.salary) - extractSalary(b.salary));
        break;
      default:
        result.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
    }

    setFilteredJobs(result);
  }, [searchTerm, location, jobType, salary, sortBy, selectedCategories, jobs]);

  // Hàm trích xuất số từ chuỗi lương
  const extractSalary = (salaryString) => {
    if (!salaryString) return 0;
    const matches = salaryString.match(/(\d+,\d+|\d+)/g);
    if (matches && matches.length > 0) {
      return parseInt(matches[0].replace(/,/g, ''));
    }
    return 0;
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search logic is already handled by useEffect
  };

  if (loading) {
    return (
      <div className="job-listing-page">
        <Header />
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách việc làm...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="job-listing-page">
      <Header />
      
      {/* Job Search Section */}
      <section className="job-search-section">
        <div className="container">
          <div className="search-filters">
            <h1>Tìm việc làm bán thời gian</h1>

            <form className="filter-row" onSubmit={handleSearch}>
              <div className="filter-group">
                <input
                  type="text"
                  placeholder="Tìm kiếm việc làm, công ty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="">Tất cả địa điểm</option>
                  <option value="hanoi">Hà Nội</option>
                  <option value="hcm">TP. Hồ Chí Minh</option>
                  <option value="danang">Đà Nẵng</option>
                </select>
              </div>
              <div className="filter-group">
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                >
                  <option value="">Tất cả loại hình</option>
                  <option value="Bán thời gian">Bán thời gian</option>
                  <option value="Toàn thời gian">Toàn thời gian</option>
                  <option value="Thực tập">Thực tập</option>
                </select>
              </div>
              <button type="submit" className="btn-search">
                Tìm kiếm
              </button>
            </form>

            <div className="advanced-filters">
              <div className="filter-group">
                <label>Mức lương tối thiểu:</label>
                <select
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                >
                  <option value="0">Tất cả mức lương</option>
                  <option value="15000">15,000 VNĐ/giờ</option>
                  <option value="20000">20,000 VNĐ/giờ</option>
                  <option value="25000">25,000 VNĐ/giờ</option>
                  <option value="30000">30,000 VNĐ/giờ</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Results */}
      <section className="job-results">
        <div className="container">
          <div className="results-header">
            <h2>Kết quả: {filteredJobs.length} công việc</h2>
            <div className="sort-options">
              <label>Sắp xếp:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="salary_high">Lương cao nhất</option>
                <option value="salary_low">Lương thấp nhất</option>
              </select>
            </div>
          </div>

          <div className="jobs-container">
            <div className="jobs-list">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))
              ) : (
                <div className="no-results">
                  <div className="no-results-icon">🔍</div>
                  <h3>Không tìm thấy công việc nào phù hợp</h3>
                  <p>Hãy thử điều chỉnh bộ lọc tìm kiếm của bạn</p>
                </div>
              )}
            </div>

            <div className="jobs-sidebar">
              <div className="sidebar-widget">
                <h3>Lọc theo danh mục</h3>
                <div className="category-filters">
                  {["Phục vụ", "Bán hàng", "Gia sư", "Công nghệ", "Giao hàng"].map(
                    (category) => (
                      <label className="category-filter" key={category}>
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                        />
                        {category}
                      </label>
                    )
                  )}
                </div>
              </div>

              <div className="sidebar-widget">
                <h3>Việc làm nổi bật</h3>
                <div className="featured-jobs-sidebar">
                  {jobs
                    .filter(job => job.isFeatured)
                    .slice(0, 3)
                    .map((job) => (
                      <div 
                        className="featured-job" 
                        key={job._id}
                        onClick={() => navigate(`/jobs/${job._id}`)}
                      >
                        <h4>{job.title}</h4>
                        <p>{job.company?.name}</p>
                        <span className="featured-salary">{job.salary}</span>
                      </div>
                    ))}
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

export default JobListing;