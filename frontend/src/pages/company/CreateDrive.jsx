import React, { useState } from 'react';
import api from '../../utils/api';

const CreateDrive = () => {
  const initialFormState = {
    job_title: '',
    job_description: '',
    eligibility_cgpa: '',
    eligible_branches: [], // Will hold array of string codes e.g. ['CSE', 'IT']
    application_deadline: '',
    package_lpa: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const branchesOptions = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (branch) => {
    setFormData(prev => {
      const branches = prev.eligible_branches.includes(branch)
        ? prev.eligible_branches.filter(b => b !== branch)
        : [...prev.eligible_branches, branch];
      return {
        ...prev,
        eligible_branches: branches
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    // Validation
    if (formData.eligible_branches.length === 0) {
      setErrorMessage('Please select at least one eligible branch.');
      return;
    }

    try {
      setLoading(true);
      // API expects body with eligible_branches as array of strings, eligibility_cgpa as float, package_lpa as float
      const payload = {
        job_title: formData.job_title,
        job_description: formData.job_description,
        eligibility_cgpa: parseFloat(formData.eligibility_cgpa),
        eligible_branches: formData.eligible_branches,
        application_deadline: formData.application_deadline,
        package_lpa: parseFloat(formData.package_lpa)
      };

      const res = await api.post('/company/drives', payload);
      
      if (res.status === 201) {
        setSuccessMessage('Drive submitted for Admin approval');
        setFormData(initialFormState);
      }
    } catch (err) {
      console.error('Error creating drive:', err);
      setErrorMessage(err.response?.data?.error || 'Failed to submit drive request. Please check fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white p-3">
              <h3 className="mb-0 fw-bold fs-4">📢 Create Placement Drive</h3>
            </div>
            <div className="card-body p-4">
              {successMessage && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <strong>Success!</strong> {successMessage}
                  <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)} aria-label="Close"></button>
                </div>
              )}

              {errorMessage && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <strong>Error:</strong> {errorMessage}
                  <button type="button" className="btn-close" onClick={() => setErrorMessage(null)} aria-label="Close"></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Job Title */}
                <div className="mb-3">
                  <label htmlFor="job_title" className="form-label fw-semibold">Job Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="job_title"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleChange}
                    placeholder="e.g. Associate Software Engineer"
                    required
                  />
                </div>

                {/* Package (LPA) & Eligibility CGPA */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="package_lpa" className="form-label fw-semibold">Package (LPA) *</label>
                    <input
                      type="number"
                      className="form-control"
                      id="package_lpa"
                      name="package_lpa"
                      value={formData.package_lpa}
                      onChange={handleChange}
                      placeholder="e.g. 8.5"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="eligibility_cgpa" className="form-label fw-semibold">Eligibility CGPA *</label>
                    <input
                      type="number"
                      className="form-control"
                      id="eligibility_cgpa"
                      name="eligibility_cgpa"
                      value={formData.eligibility_cgpa}
                      onChange={handleChange}
                      placeholder="e.g. 7.5"
                      min="0"
                      max="10"
                      step="0.1"
                      required
                    />
                  </div>
                </div>

                {/* Eligible Branches Checkboxes */}
                <div className="mb-3">
                  <label className="form-label fw-semibold d-block">Eligible Branches *</label>
                  <div className="card bg-light p-3">
                    <div className="row">
                      {branchesOptions.map(branch => (
                        <div key={branch} className="col-md-4 col-6 mb-2">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`branch-${branch}`}
                              checked={formData.eligible_branches.includes(branch)}
                              onChange={() => handleCheckboxChange(branch)}
                            />
                            <label className="form-check-input-label text-dark ps-2" htmlFor={`branch-${branch}`}>
                              {branch}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Application Deadline */}
                <div className="mb-3">
                  <label htmlFor="application_deadline" className="form-label fw-semibold">Application Deadline *</label>
                  <input
                    type="date"
                    className="form-control"
                    id="application_deadline"
                    name="application_deadline"
                    value={formData.application_deadline}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Job Description */}
                <div className="mb-4">
                  <label htmlFor="job_description" className="form-label fw-semibold">Job Description *</label>
                  <textarea
                    className="form-control"
                    id="job_description"
                    name="job_description"
                    rows="5"
                    value={formData.job_description}
                    onChange={handleChange}
                    placeholder="Provide details about the job profile, roles and responsibilities..."
                    required
                  ></textarea>
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-success p-2.5 fw-bold btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Placement Drive'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDrive;
