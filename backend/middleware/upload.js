import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

import cloudinary from '../config/cloudinary.js'

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    let resourceType = 'image'

    // PDF support
    if (file.mimetype === 'application/pdf') {
      resourceType = 'raw'
    }

    return {
      folder: 'placements',
      resource_type: resourceType,
    }
  },
})

const upload = multer({ storage })

export default upload