const Post = require('../models/postModel')
const User = require('../models/userModel')
const Category = require('../models/categoryModel');
const path = require('path')
const fs = require('fs')
const { v4: uuid } = require("uuid")
const HttpError = require('../models/errorModel')
const { mongoose } = require('mongoose')


const createPost = async (req, res, next) => {
    try {
        const { title, categoryId, description } = req.body;

        // Validate input fields
        if (!title || !categoryId || !description || !req.files) {
            console.error("Validation error: missing fields");
            console.log({ title, categoryId, description, files: req.files });
            return next(new HttpError("Please fill in all fields and choose a thumbnail.", 422));
        }

        // Validate category
        const category = await Category.findById(categoryId);
        if (!category) {
            console.error("Category not found");
            return next(new HttpError("Category not found.", 404));
        }

        // Validate thumbnail file
        const { thumbnail } = req.files;
        if (thumbnail.size > 2000000) {
            console.error("Thumbnail too big");
            return next(new HttpError("Thumbnail too big. File size should be less than 2MB.", 422));
        }

        // Generate new filename
        const fileName = thumbnail.name;
        const splittedFilename = fileName.split('.');
        const newFilename = `${splittedFilename[0]}_${uuid()}.${splittedFilename[splittedFilename.length - 1]}`;

        // Move the file to the uploads directory
        const uploadPath = path.join(__dirname, '..', 'uploads', newFilename);
        thumbnail.mv(uploadPath, async (err) => {
            if (err) {
                console.error("File upload failed:", err);
                return next(new HttpError("File upload failed.", 500));
            }

            try {
                // Create new post
                const newPost = await Post.create({
                    title,
                    category: categoryId,
                    description,
                    thumbnail: newFilename,
                    creator: req.user.id
                });

                if (!newPost) {
                    console.error("Post creation failed");
                    return next(new HttpError("Something went wrong while creating the post.", 500));
                }

                // Update user post count
                const currentUser = await User.findById(req.user.id);
                const userPostCount = (currentUser.posts || 0) + 1;
                await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });

                console.log("Post created successfully:", newPost);
                // Return success response
                res.status(201).json(newPost);
            } catch (dbError) {
                console.error("Database error:", dbError);
                return next(new HttpError("Database error occurred while creating the post.", 500));
            }
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return next(new HttpError("Internal Server Error", 500));
    }
};



//============================== GET ALL POSTS
// GET : api/posts/
// UNPROTECTED
const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({updatedAt: -1});
        res.status(200).json(posts);
    } catch (error) {
        return next(new HttpError(error))
    }
}




//============================== GET SINGLE POSTS
// GET : api/posts/:id
// UNPROTECTED
const getPost = async (req, res, next) => {
    try {
        const postID = req.params.id;
        const post = await Post.findById(postID);
        if(!post) {
            return next(new HttpError("Post not found.", 404))
        }
        res.status(200).json(post);
    } catch (error) {
        return next(new HttpError(error));
    }
}


//============================== GET POSTS BY CATEGORY
// GET : api/posts/categories/:category
// UNPROTECTED
const getCatPosts = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const category = await Category.findById(categoryId);
        if (!category) {
            return next(new HttpError("Category not found.", 404));
        }
        const catPosts = await Post.find({ category: categoryId }).sort({ createdAt: -1 });
        res.json(catPosts);
    } catch (error) {
        return next(new HttpError(error));
    }
};
//============================== GET POSTS BY AUTHOR
// GET : api/posts/users/:id
// UNPROTECTED
const getUserPosts = async (req, res, next) => {
    const {id} = req.params;
    try {
        const posts = await Post.find({creator: id}).sort({createdAt: -1})
        res.json(posts)
    } catch (error) {
        return next(new HttpError(error))
    }
}





//============================== EDIT POST
// PATCH : api/posts/:id
// PROTECTED
const editPost = async (req, res, next) => {
    let fileName;
    let newFilename;
    let updatedPost
    try {
        const postID = req.params.id;
        let {title, category, description} = req.body;
        // ReactQuill has a paragraph opening and closing tag with a break tag in between so there are 11 characters in there already. That's why 12 
        if(!title || !category || description.length < 12) {
            return next(new HttpError("Fill all fields", 422))
        }
        
        // get old post from db
        const oldPost = await Post.findById(postID);

        if(req.user.id == oldPost.creator) {
            // update post without thumbnail
            if(!req.files) {
                updatedPost = await Post.findByIdAndUpdate(postID, {title, category, description}, {new: true})
            } else {
                // delete old thumbnail from uploads
                fs.unlink(path.join(__dirname, '..', 'uploads', oldPost.thumbnail), async (err) => {
                if (err) {
                    return next(new HttpError(err))
                }})
                
                // upload new thumbnail
                const {thumbnail} = req.files;
                // check file size
                if(thumbnail.size > 2000000) {
                    return next(new HttpError("Thumbnail too big. Should be less than 2mb"))
                }
                fileName = thumbnail.name;
                let splittedFilename = fileName.split('.')
                newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1]
                thumbnail.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err) => {
                    if(err) {
                        return next(new HttpError(err))
                    }
                })
        
                updatedPost = await Post.findByIdAndUpdate(postID, {title, category, description, thumbnail: newFilename}, {new: true})
            }
        } else {
            return next(new HttpError("Couldn't update post.", 403))
        }

        if(!updatedPost) {
            return next(new HttpError("Couldn't update post", 400))
        }
        res.json(updatedPost)

    } catch (error) {
        return next(new HttpError(error))
    }
}





//============================== DELETE POST
// DELETE : api/posts/:id
// PROTECTED
const removePost = async (req, res, next) => {
    const postID = req.params.id;
    if(!postID) {
        return next(new HttpError("Post unavailable"))
    }
    const post = await Post.findById(postID);
    const fileName = post?.thumbnail;
    if(req.user.id == post.creator) {
        // delete thumbnail from uploads
    fs.unlink(path.join(__dirname, '..', 'uploads', fileName), async (err) => {
        if (err) {
            return next(err)
        } else {
            await Post.findByIdAndDelete(postID)
            // Find user and reduce posts count by 1
            const currentUser = await User.findById(req.user.id)
            const userPostCount = currentUser?.posts - 1;
            await User.findByIdAndUpdate(req.user.id, {posts: userPostCount})
            res.json("Post deleted")
        }
        })
    } else {
        return next(new HttpError("Couldn't delete post.", 403))
    }
}

module.exports = {getPosts, getPost, getCatPosts, getUserPosts, createPost, editPost, removePost}