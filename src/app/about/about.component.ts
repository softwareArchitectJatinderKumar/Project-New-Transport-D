import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-about',
  imports: [CommonModule],
  template: `
    <div class="container-fluid mt-4">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title">About</h3>
              <p class="text-muted">This is a starter template integrated into the Transport App project.</p>
              <div class="row mt-4">
                <div class="col-md-6">
                  <h5>Features</h5>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item">Transport data management</li>
                    <li class="list-group-item">Excel file processing</li>
                    <li class="list-group-item">User authentication</li>
                    <li class="list-group-item">Responsive design</li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <h5>Technologies</h5>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item">Angular</li>
                    <li class="list-group-item">Bootstrap</li>
                    <li class="list-group-item">ExcelJS</li>
                    <li class="list-group-item">TypeScript</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [``]
})
export class AboutComponent {}
