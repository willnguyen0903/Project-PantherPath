document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reportForm');
    const reportList = document.getElementById('reportList');
  
    const loadReports = async () => {
      const res = await fetch('https://project-pantherpath.onrender.com/reports');
      const reports = await res.json();
      reportList.innerHTML = '';
      reports.forEach(report => {
        const div = document.createElement('div');
        div.className = 'report';
        div.innerHTML = `
          <p><strong>${report.username}</strong> @ ${report.location}</p>
          <p>${report.description}</p>
          <div class="votes">
            <button onclick="vote(${report.report_id}, 'up')">👍 ${report.upvotes}</button>
            <button onclick="vote(${report.report_id}, 'down')">👎 ${report.downvotes}</button>
          </div>
          <small>Posted at ${new Date(report.timestamp).toLocaleString()}</small>
        `;
        reportList.appendChild(div);
      });
    };
  
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const location = document.getElementById('location').value;
      const description = document.getElementById('description').value;
  
      await fetch('https://project-pantherpath.onrender.com/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, location, description })
      });
  
      form.reset();
      loadReports();
    });
  
    window.vote = async (id, type) => {
      await fetch(`https://project-pantherpath.onrender.com/reports/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      loadReports();
    };
  
    loadReports();
  });
  