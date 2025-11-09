import { useState } from 'react'
import { Upload, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react'

const Import = () => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:4000/api/import/excel', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        setFile(null)
        // Reset file input
        document.getElementById('file-input').value = ''
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch (err) {
      setError('Failed to upload file. Make sure the server is running.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Import Data</h2>
        <p className="text-gray-600 mt-1">Upload Excel file to import flats and flatmates data</p>
      </div>

      {/* Instructions Card */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Excel File Format</h3>
        <p className="text-sm text-blue-800 mb-2">Your Excel file should contain the following columns:</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
          <li><strong>Flat No</strong> - Flat number (e.g., A-101, B-203)</li>
          <li><strong>BHK</strong> - Flat type (e.g., 2BHK, 3BHK)</li>
          <li><strong>Area in SQFT</strong> - Flat area in square feet</li>
          <li><strong>Mobile No</strong> - Resident's mobile number</li>
          <li><strong>Email ID</strong> - Resident's email address</li>
          <li><strong>Name</strong> - Resident's full name (optional)</li>
          <li><strong>Floor</strong> - Floor number (optional)</li>
        </ul>
        <p className="text-sm text-blue-800 mt-3">
          <strong>Note:</strong> Column names are flexible. The system will automatically detect variations 
          like "Flat", "Apt No", "Area", "SQFT", "Phone", "Mobile", etc.
        </p>
      </div>

      {/* Upload Card */}
      <div className="card">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Excel File (.xlsx, .xls)
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex-1">
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    cursor-pointer"
                />
              </label>
            </div>
            {file && (
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload & Import
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {result && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-lg font-semibold text-green-900">Import Successful!</h4>
              <p className="text-sm text-green-700 mt-1">
                Successfully imported {result.imported} record(s) into the database.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-lg font-semibold text-red-900">Import Failed</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Example Data Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Data Format</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flat No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BHK
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Area in SQFT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mobile No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">A-101</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2BHK</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1200</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">+91 98765 43210</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">rajesh@example.com</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rajesh Kumar</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">B-203</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3BHK</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1500</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">+91 98765 43211</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">priya@example.com</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Priya Sharma</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Import
