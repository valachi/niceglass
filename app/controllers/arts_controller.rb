#coding: utf-8
class ArtsController < ApplicationController
  http_basic_authenticate_with :name => "nicegirls", :password => "nicegirls"
  layout 'admin'
  # GET /arts
  # GET /arts.json
  def index
    @arts = Art.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @arts }
    end
  end

  # GET /arts/new
  # GET /arts/new.json
  def new
    @art = Art.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @art }
    end
  end

  # GET /arts/1/edit
  def edit
    @art = Art.find(params[:id])
  end

  # POST /arts
  # POST /arts.json
  def create
    @art = Art.new(params[:art])

    respond_to do |format|
      if @art.save
        format.html { redirect_to arts_path, notice: 'Работа была добавлена в галерею' }
        format.json { render json: @art, status: :created, location: @art }
      else
        format.html { render action: "new" }
        format.json { render json: @art.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /arts/1
  # PUT /arts/1.json
  def update
    @art = Art.find(params[:id])

    respond_to do |format|
      if @art.update_attributes(params[:art])
        format.html { redirect_to arts_path, notice: 'Работа была отредактирована' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @art.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /arts/1
  # DELETE /arts/1.json
  def destroy
    @art = Art.find(params[:id])
    @art.destroy

    respond_to do |format|
      format.html { redirect_to arts_url }
      format.json { head :no_content }
    end
  end
end
